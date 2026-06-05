using DancesportCMS_api.Models;
using DancesportCMS_api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace DancesportCMS_api.Controllers
{
    [ApiController]
    [Route("api/judge")]
    public class JudgeAuthController:ControllerBase
    {
        private readonly UserRepository _repo;

        public  JudgeAuthController(UserRepository repo)
        {
            _repo = repo;
        }
        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] JudgeAuthRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.PIN) || request.PIN.Length != 4)
            {
                return BadRequest(new { error = "Невалиден PIN формат" });
            }

            var session = await _repo.AuthenticateByPINAsync(request.PIN);

            if (session is null)
            {
                return Unauthorized(new { error = "Невалиден PIN" });
            }

            return Ok(session);
        }
        [HttpGet("{userID}/active-rounds")]
        public async Task<IActionResult>GetActiveRounds (long userID)
        {
            var rounds = await _repo.GetActiveRoundsForJudgeAsync(userID);
            return Ok(rounds);
        }
    }
}
