using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VisitsController(IVisitsService visitsService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Visit>>> GetVisits(
        [FromQuery] string? executive,
        [FromQuery] DateOnly? date)
    {
        var visits = await visitsService.GetVisitsAsync(executive, date);
        return Ok(visits);
    }

    [HttpGet("executives")]
    public async Task<ActionResult<IEnumerable<string>>> GetExecutives()
    {
        var executives = await visitsService.GetExecutivesAsync();
        return Ok(executives);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Visit>> GetVisit(string id)
    {
        var visit = await visitsService.GetVisitAsync(id);
        return visit is null ? NotFound() : Ok(visit);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateVisit(string id, [FromBody] UpdateVisitRequest request)
    {
        var result = await visitsService.UpdateVisitAsync(id, request);

        return result.StatusCode switch
        {
            StatusCodes.Status200OK => Ok(result.Visit),
            StatusCodes.Status404NotFound => NotFound(result.ErrorMessage),
            _ => BadRequest(result.ErrorMessage)
        };
    }

    [HttpGet("download")]
    public async Task<IActionResult> DownloadCsv()
    {
        var result = await visitsService.GenerateCsvAsync();

        if (!result.Success)
        {
            return StatusCode(500, result.Message);
        }

        return File(
            result.Data!,
            "text/csv",
            "visits.csv"
        );
    }
}
