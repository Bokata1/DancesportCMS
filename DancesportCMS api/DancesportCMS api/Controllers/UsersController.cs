using Microsoft.AspNetCore.Mvc;
using DancesportCMS_api.Repositories;

namespace DancesportCMS_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserRepository _repo;

        public UsersController(UserRepository repo)
        {
            _repo = repo;
        }
        [HttpGet("judges")]
        public async Task<IActionResult> GetAll()
        {
            var judges = await _repo.GetAllAsync();
            return Ok(judges);
        }
        
    }
}
