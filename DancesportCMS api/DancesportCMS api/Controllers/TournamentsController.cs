using DancesportCMS_api.Models;
using DancesportCMS_api.Repositories;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace DancesportCMS_api.Controllers;
[ApiController]
[Route("api/[controller]")]
public class TournamentsController : ControllerBase
{
    private readonly TournamentRepository _repo;

    public TournamentsController(TournamentRepository repo)
    {
        _repo = repo;
    }
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tournaments = await _repo.GetAllAsync();
        return Ok(tournaments);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(long id)
    {
        var tournaments = await _repo.GetByIdAsync(id);
        if (tournaments is null)
            return NotFound();
        return Ok(tournaments);
    }

    [HttpGet("{id}/details")]

    public async Task<IActionResult> GetDetail(long id)
    {
        var detail = await _repo.GetDetailAsync(id);

        if (detail is null)
            return NotFound();

        return Ok(detail);
    }
    [HttpPost]
    public async Task<IActionResult> CreateTournament([FromBody] CreateTournamentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TournamentName))
            return BadRequest(new { error = "Името на турнира е задължително" });

        if (string.IsNullOrWhiteSpace(request.Location))
            return BadRequest(new { error = "Локацията е задължителна" });

        var tournamentID = await _repo.CreateTournamentAsync(request);

        return Ok(new { tournamentID, success = true });
    }

    [HttpPost("{id}/registration")]
    public async Task<IActionResult> SetRegistration(long id, [FromBody] SetRegistrationRequest request)
    {
        var (success, error) = await _repo.SetRegistrationOpenAsync(id, request.IsOpen);

        if (!success)
            return BadRequest(new { error });

        return Ok(new { success = true });
    }

    public class SetRegistrationRequest
    {
        public bool IsOpen { get; set; }
    }
    [HttpGet("open-for-registration")]
    public async Task<IActionResult> GetOpenForRegistration()
    {
        var tournaments = await _repo.GetOpenForRegistrationAsync();
        return Ok(tournaments);
    }

    [HttpPost("register-couple")]
    public async Task<IActionResult> RegisterCouple([FromBody] CoupleRegistrationRequest request)

    {
        if (string.IsNullOrWhiteSpace(request.Partner1Name))
            return BadRequest(new { error = "Името на 1вия парньор е задължително" });
        if (string.IsNullOrWhiteSpace(request.Partner2Name))
            return BadRequest(new { error = "Името на 2рия парньор е задължително" });
        if (string.IsNullOrWhiteSpace(request.ClubName))
            return BadRequest(new { error = "Клуба е задължителен" });
        var (success, error, registrationID) = await _repo.RegisterCoupleAsync(request);
        if (!success) return BadRequest(new { error });
        return Ok(new {success = true, registrationID});
    }
}
