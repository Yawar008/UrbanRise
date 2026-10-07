using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Backend.Tests;

public class VisitsServiceTests
{
    [Fact]
    public async Task GetVisitsAsync_FiltersByExecutiveAndDate()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        await using var context = new AppDbContext(options);

        context.Visits.AddRange(
            new Visit
            {
                VisitId = "V001",
                LeadId = "L001",
                CustomerName = "Customer 1",
                Phone = "9876543210",
                Project = "Project A",
                Config = "2BHK",
                VisitAt = new DateTime(2026, 10, 7, 10, 0, 0),
                Executive = "John",
                Outcome = "Interested",
                NextAction = "Call on Monday"
            },
            new Visit
            {
                VisitId = "V002",
                LeadId = "L002",
                CustomerName = "Customer 2",
                Phone = "9876543211",
                Project = "Project A",
                Config = "3BHK",
                VisitAt = new DateTime(2026, 10, 7, 11, 0, 0),
                Executive = "Jane",
                Outcome = "Needs time",
                NextAction = "Call on Tuesday"
            },
            new Visit
            {
                VisitId = "V003",
                LeadId = "L003",
                CustomerName = "Customer 3",
                Phone = "9876543212",
                Project = "Project B",
                Config = "2BHK",
                VisitAt = new DateTime(2026, 10, 8, 10, 0, 0),
                Executive = "John",
                Outcome = "Interested",
                NextAction = "Send price sheet"
            });

        await context.SaveChangesAsync();

        var service = new VisitsService(context);

        // Act
        var result = await service.GetVisitsAsync(
            "John",
            new DateOnly(2026, 10, 7));

        // Assert
        var visit = Assert.Single(result);

        Assert.Equal("V001", visit.VisitId);
        Assert.Equal("John", visit.Executive);
        Assert.Equal(
            new DateTime(2026, 10, 7, 10, 0, 0),
            visit.VisitAt);
        Assert.Equal("******3210", visit.Phone);
    }
}
