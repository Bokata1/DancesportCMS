using DancesportCMS_api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace DancesportCMS_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BiasController :ControllerBase
    {
        private readonly BiasRepository _repo;

        public BiasController(BiasRepository repo)
        {
            _repo = repo;
        }

        [HttpGet("judge-club-matrix")]
        public async Task<IActionResult> GetJudgeClubMatrix()
        {
            var data = await _repo.GetJudgeClubMatrixAsync();
            return Ok(data);
        }
    }
}
