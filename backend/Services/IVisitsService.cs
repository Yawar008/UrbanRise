using backend.Models;

namespace backend.Services;

public interface IVisitsService
{
    Task<IReadOnlyList<Visit>> GetVisitsAsync(string? executive, DateOnly? date);
    Task<IReadOnlyList<string>> GetExecutivesAsync();
    Task<Visit?> GetVisitAsync(string visitId);
    Task<UpdateVisitResult> UpdateVisitAsync(string visitId, UpdateVisitRequest request);
    Task<ServiceResult<byte[]>> GenerateCsvAsync();
}

public sealed record UpdateVisitRequest(string Outcome, string NextAction);

public sealed record UpdateVisitResult(bool Success, int StatusCode, string? ErrorMessage = null, Visit? Visit = null);
