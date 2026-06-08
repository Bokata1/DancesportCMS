using DancesportCMS_api.Models;
using DancesportCMS_api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace DancesportCMS_api.Controllers
{
   
        [ApiController]
        [Route("api/[controller]")]
        public class RulesViolationsController : ControllerBase
        {
            private readonly RulesViolationsRepository _repo;

            public RulesViolationsController(RulesViolationsRepository repo)
            {
                _repo = repo;
            }

            [HttpPost("toggle")]
            public async Task<IActionResult> Toggle([FromBody] ToggleViolationRequest request)
            {
                var (success, error, isNowFlagged) = await _repo.ToggleViolationAsync(request);

                if (!success)
                    return BadRequest(new { error });

                return Ok(new { success = true, isNowFlagged });
            }

            [HttpGet("round/{roundID}")]
            public async Task<IActionResult> GetRoundView(long roundID)
            {
                var view = await _repo.GetRoundViewAsync(roundID);

                if (view is null)
                    return NotFound();

                return Ok(view);
            }
        }
}
