using Microsoft.AspNetCore.Mvc;
using DancesportCMS_api.Repositories;

namespace DancesportCMS_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DancesController : ControllerBase
    {
        private readonly DanceRepository _repo;
        public DancesController(DanceRepository repo)
        {
            _repo = repo;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var dances = await _repo.GetAllAsync();
            return Ok(dances);
        }

       
    }
}
