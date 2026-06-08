using DancesportCMS_api.Models;
using DancesportCMS_api.Repositories;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.InteropServices;

namespace DancesportCMS_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoundsController : ControllerBase
    {


        private readonly TournamentRepository _repo;

        public RoundsController(TournamentRepository repo)
        {
            _repo = repo;
        }
        [HttpGet("{id}/skating")]
        public async Task<IActionResult> GetSkatingSheet(long id)
        {
            var sheet = await _repo.GetSkatingSheetAsync(id);
            if (sheet is null)
                return NotFound();

            return Ok(sheet);
        }

        [HttpGet("{id}/for-judging")]
        public async Task<IActionResult> GetForJudging(long id)
        {
            var round = await _repo.GetRoundForJudgingAsync(id);
            if (round is null) return NotFound();
            return Ok(round);
        }

        [HttpPost("submit-marks")]
        public async Task<IActionResult> SubmitMarks([FromBody] MarkSubmissionRequest request)
        {
            if (request.Marks.Count == 0) return BadRequest(new { error = "Няма въведени оценки" });
            var (success, error) = await _repo.SubmitMarksAsync(request);

            if (!success)
                return BadRequest(new { error });

            return Ok(new { success = true });
        }

        [HttpGet("{id}/progress")]
        public async Task<IActionResult> GetProgress(long id)
        {
            var progress = await _repo.GetRoundProgressAsync(id);
            if (progress is null) return NotFound();
            return Ok(progress);
        }

        [HttpPost("{id}/status")]
        public async Task<IActionResult>SetStatus (long id, [FromBody] SetRoundStatusRequest request)
        {
            var (success, error) = await _repo.SetRoundStatusAsync(id, request.Status);
            if(!success) return BadRequest(new { error });
            return Ok(new { success = true });
           }

        [HttpPost("{id}/finalize")]
        public async Task<IActionResult> FinalizeRound(long id)
        {
            var (success, error) = await _repo.FinalizeRoundAsync(id);

            if (!success) return BadRequest(new { error });

            return Ok(new { success = true });
        }


        [HttpGet("{id}/qualifying-sheet")]
        public async Task <IActionResult> GetQualifyingSheet(long id)
        {
            var sheet = await _repo.GetQualifyingSheetAsync(id);
            if (sheet is null) return NotFound();
            return Ok(sheet);

        }

        [HttpPost]
        public async Task<IActionResult> AddRound([FromBody] AddRoundRequest request)
        {
            var (success, error, roundID) = await _repo.AddRoundAsync(request);

            if (!success)
                return BadRequest(new { error });

            return Ok(new { success = true, roundID });
        }

        [HttpPost("{id}/assign-judges")]
        public async Task<IActionResult> AssignJudges(long id, [FromBody] AssignJudgesRequest request)
        {
            if (request.JudgeUserIDs == null || request.JudgeUserIDs.Count == 0)
                return BadRequest(new { error = "Изберете поне един съдия" });

            var (success, error) = await _repo.AssignJudgesToRoundAsync(id, request.JudgeUserIDs);

            if (!success)
                return BadRequest(new { error });

            return Ok(new { success = true });
        }
    }
     
    
}
