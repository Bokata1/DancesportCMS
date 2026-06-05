using DancesportCMS_api.Models;
using DancesportCMS_api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace DancesportCMS_api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController: ControllerBase
    {
        private readonly UserRepository _repo;
        public AuthController (UserRepository repo)
        {
            _repo = repo;
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { error = "Моля попълнете имейл и парола" });
            }

            var session = await _repo.LoginAsync(request.Email, request.Password);

            if (session is null)
            {
                return Unauthorized(new { error = "Невалиден имейл или парола" });
            }

            return Ok(session);
        }
    }
}
