using CsvHelper.Configuration.Attributes;

namespace backend.Models;

public class Visit
{
    public string VisitId { get; set; } = string.Empty;
    public string LeadId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Project { get; set; } = string.Empty;
    public string Config { get; set; } = string.Empty;
    public DateTime VisitAt { get; set; }
    public string Executive { get; set; } = string.Empty;
    public string Outcome { get; set; } = string.Empty;
    public string NextAction { get; set; } = string.Empty;
}

public class VisitCsvModel
{
    [Name("visit_id")]
    public string VisitId { get; set; } = string.Empty;

    [Name("lead_id")]
    public string LeadId { get; set; } = string.Empty;

    [Name("customer_name")]
    public string CustomerName { get; set; } = string.Empty;

    [Name("phone")]
    public string Phone { get; set; } = string.Empty;

    [Name("project")]
    public string Project { get; set; } = string.Empty;

    [Name("config")]
    public string Config { get; set; } = string.Empty;

    [Name("visit_at")]
    public DateTime VisitAt { get; set; }

    [Name("executive")]
    public string Executive { get; set; } = string.Empty;

    [Name("outcome")]
    public string Outcome { get; set; } = string.Empty;

    [Name("next_action")]
    public string NextAction { get; set; } = string.Empty;
}

public class ServiceResult<T>
{
    public bool Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public T? Data { get; set; }

    public static ServiceResult<T> SuccessResult(T data, string message = "")
    {
        return new ServiceResult<T>
        {
            Success = true,
            Data = data,
            Message = message
        };
    }

    public static ServiceResult<T> Failure(string message)
    {
        return new ServiceResult<T>
        {
            Success = false,
            Message = message
        };
    }
}
