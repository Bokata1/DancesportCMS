using Microsoft.AspNetCore.Mvc;
using DancesportCMS_api.Repositories;

namespace DancesportCMS_api.Controllers;
[ApiController]
[Route("api/[controller]")]
public class TournamentsController:ControllerBase
{
    private readonly TournamentRepository _repo;

    public TournamentsController(TournamentRepository repo)
    { 
        _repo = repo;
    }
    [HttpGet]
    public async Task <IActionResult> GetAll()
    {
        var tournaments = await _repo.GetAllAsync();
        return Ok(tournaments);
    }

    [HttpGet ("{id}")]
    public async Task <IActionResult> GetById (long id)
    {
        var tournaments = await _repo.GetByIdAsync(id);
        if (tournaments is null)
            return NotFound();
            return Ok(tournaments);
    }

}
