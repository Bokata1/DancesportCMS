using DancesportCMS_api.Models;
using DancesportCMS_api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace DancesportCMS_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VotingController : ControllerBase
    {
        private readonly VotingRepository _repo;

        public VotingController(VotingRepository repo)
        {
            _repo = repo;
        }

        [HttpPost("cast")]
        public async Task<IActionResult> CastVote([FromBody] CastVoteRequest request)
        {
            var (success, error) = await _repo.CastVoteAsync(request);

            if (!success)
                return BadRequest(new { error });

            return Ok(new { success = true });
        }

        [HttpGet("{tournamentID}/{categoryID}/results")]
        public async Task<IActionResult> GetResults(long tournamentID, long categoryID)
        {
            var results = await _repo.GetResultsAsync(tournamentID, categoryID);

            if (results is null)
                return NotFound();

            return Ok(results);
        }

        [HttpGet("{tournamentID}/{categoryID}/couples")]
        public async Task<IActionResult> GetVotableCouples(long tournamentID, long categoryID)
        {
            var couples = await _repo.GetVotableCouplesAsync(tournamentID, categoryID);
            return Ok(couples);
        }
    }
}

