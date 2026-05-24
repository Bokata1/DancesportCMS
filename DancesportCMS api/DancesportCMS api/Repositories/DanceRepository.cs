using Dapper;
using DancesportCMS_api.Models;
using Microsoft.Data.SqlClient;


namespace DancesportCMS_api.Repositories
{
    public class DanceRepository
    {
        private readonly string _connectionString;

        public DanceRepository(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DancesportDB")!;
        }

        public async Task<IEnumerable<Dance>> GetAllAsync()
        {
            using var conn = new SqlConnection(_connectionString);

            var sql = @"
                    select DanceID,Name,DanceStyle
                    from core.Dances
                    order by DanceStyle,DanceID";

            return await conn.QueryAsync<Dance>(sql);

        }





    }
}
