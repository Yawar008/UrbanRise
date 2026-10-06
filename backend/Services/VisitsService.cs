using backend.Models;
using System.Globalization;
using System.Text;
using CsvHelper;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public sealed class VisitsService(AppDbContext context) : IVisitsService
{
    private static readonly HashSet<string> AllowedOutcomes = new(StringComparer.OrdinalIgnoreCase)
    {
        "Interested",
        "Needs time",
        "Not interested",
        "No show"
    };

    private static readonly HashSet<string> AllowedNextActions = new(StringComparer.OrdinalIgnoreCase)
    {
        "Send price sheet",
        "Second visit with wife",
        "Second visit with Family",
        "Call on Monday",
        "Call on Tuesday",
        "Call on Wednesday",
        "Call on Thursday",
        "Call on Friday",
        "Call on Saturday",
        "Call on Sunday"
    };

    public async Task<IReadOnlyList<Visit>> GetVisitsAsync(string? executive, DateOnly? date)
    {
        IQueryable<Visit> query = context.Visits.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(executive))
        {
            query = query.Where(visit => visit.Executive == executive);
        }

        if (date.HasValue)
        {
            var start = date.Value.ToDateTime(TimeOnly.MinValue);
            var end = start.AddDays(1);
            query = query.Where(visit => visit.VisitAt >= start && visit.VisitAt < end);
        }

        return await query
            .OrderBy(visit => visit.VisitAt)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<string>> GetExecutivesAsync()
    {
        return await context.Visits
            .AsNoTracking()
            .Where(visit => !string.IsNullOrWhiteSpace(visit.Executive))
            .Select(visit => visit.Executive)
            .Distinct()
            .OrderBy(executive => executive)
            .ToListAsync();
    }

    public async Task<Visit?> GetVisitAsync(string visitId)
    {
        return await context.Visits
            .AsNoTracking()
            .FirstOrDefaultAsync(visit => visit.VisitId == visitId);
    }

    public async Task<UpdateVisitResult> UpdateVisitAsync(string visitId, UpdateVisitRequest request)
    {
        if (string.IsNullOrWhiteSpace(visitId))
        {
            return new UpdateVisitResult(false, StatusCodes.Status400BadRequest, "Visit ID is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Outcome) || !AllowedOutcomes.Contains(request.Outcome))
        {
            return new UpdateVisitResult(false, StatusCodes.Status400BadRequest, "Invalid outcome.");
        }

        if (string.IsNullOrWhiteSpace(request.NextAction) || !AllowedNextActions.Contains(request.NextAction))
        {
            return new UpdateVisitResult(false, StatusCodes.Status400BadRequest, "Invalid next action.");
        }

        var visit = await context.Visits.FirstOrDefaultAsync(item => item.VisitId == visitId);

        if (visit is null)
        {
            return new UpdateVisitResult(false, StatusCodes.Status404NotFound, "Visit not found.");
        }

        visit.Outcome = request.Outcome;
        visit.NextAction = request.NextAction;

        await context.SaveChangesAsync();

        return new UpdateVisitResult(true, StatusCodes.Status200OK, Visit: visit);
    }

    public async Task<ServiceResult<byte[]>> GenerateCsvAsync()
    {
        try
        {
            var visits = await context.Visits
                .AsNoTracking()
                .OrderBy(v => v.VisitId)
                .ToListAsync();

            using var memoryStream = new MemoryStream();

            await using (var writer = new StreamWriter(
                memoryStream,
                new UTF8Encoding(encoderShouldEmitUTF8Identifier: true),
                leaveOpen: true))
            using (var csv = new CsvWriter(writer, CultureInfo.InvariantCulture))
            {
                csv.WriteHeader<VisitCsvModel>();
                await csv.NextRecordAsync();

                foreach (var visit in visits)
                {
                    var csvRecord = new VisitCsvModel
                    {
                        VisitId = visit.VisitId,
                        LeadId = visit.LeadId,
                        CustomerName = visit.CustomerName,
                        Phone = visit.Phone,
                        Project = visit.Project,
                        Config = visit.Config,
                        VisitAt = visit.VisitAt,
                        Executive = visit.Executive,
                        Outcome = visit.Outcome,
                        NextAction = visit.NextAction
                    };

                    csv.WriteRecord(csvRecord);
                    await csv.NextRecordAsync();
                }
            }

            return ServiceResult<byte[]>.SuccessResult(memoryStream.ToArray());
        }
        catch (Exception ex)
        {
            return ServiceResult<byte[]>.Failure(
                $"Failed to generate CSV: {ex.Message}");
        }
    }
}
