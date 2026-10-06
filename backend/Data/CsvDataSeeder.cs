using backend.Models;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

public static class CsvDataSeeder
{
    public static async Task SeedVisitsAsync(AppDbContext context, IWebHostEnvironment environment)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Visits.AnyAsync())
        {
            return;
        }

        var csvPath = Path.Combine(environment.ContentRootPath, "visits.csv");

        if (!File.Exists(csvPath))
        {
            throw new FileNotFoundException($"The seed file was not found: {csvPath}");
        }

        using var reader = new StreamReader(csvPath);
        using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            MissingFieldFound = null,
            HeaderValidated = null,
            TrimOptions = TrimOptions.Trim
        });

        csv.Context.RegisterClassMap<VisitMap>();

        var visits = csv.GetRecords<Visit>().ToList();

        await context.Visits.AddRangeAsync(visits);
        await context.SaveChangesAsync();
    }

    private sealed class VisitMap : ClassMap<Visit>
    {
        public VisitMap()
        {
            Map(visit => visit.VisitId).Name("visit_id");
            Map(visit => visit.LeadId).Name("lead_id");
            Map(visit => visit.CustomerName).Name("customer_name");
            Map(visit => visit.Phone).Name("phone");
            Map(visit => visit.Project).Name("project");
            Map(visit => visit.Config).Name("config");
            Map(visit => visit.VisitAt).Name("visit_at");
            Map(visit => visit.Executive).Name("executive");
            Map(visit => visit.Outcome).Name("outcome");
            Map(visit => visit.NextAction).Name("next_action");
        }
    }
}
