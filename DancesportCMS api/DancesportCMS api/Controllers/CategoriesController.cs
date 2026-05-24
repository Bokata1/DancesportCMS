using Microsoft.AspNetCore.Mvc;
using DancesportCMS_api.Repositories;


namespace DancesportCMS_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly CategoryRepository _repo;

        public CategoriesController(CategoryRepository repo)
        {
            _repo = repo;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _repo.GetAllAsync();
            return Ok(categories);
        }


    }
}
