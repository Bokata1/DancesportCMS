using Dapper;
using DancesportCMS_api.Models;
using Microsoft.Data.SqlClient;



namespace DancesportCMS_api.Repositories
{
    public class CategoryRepository
    {
        private readonly string _connectionString;

        public CategoryRepository(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DancesportDB")!;
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            using var conn = new SqlConnection(_connectionString);

            var sql = @"
                    select CategoryID, AgeGroup, Class,DanceStyle
                    from core.Categories
                    order by AgeGroup,Class,DanceStyle";

            return await conn.QueryAsync<Category>(sql);

        }

    }
}
