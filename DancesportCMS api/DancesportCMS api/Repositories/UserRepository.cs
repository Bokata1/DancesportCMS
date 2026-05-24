using Dapper;
using DancesportCMS_api.Models;
using Microsoft.Data.SqlClient;


namespace DancesportCMS_api.Repositories
{
    public class UserRepository
    {
        private readonly string _connectionString;

        public UserRepository(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DancesportDB")!;
        }

        public async Task<IEnumerable<JudgeUser>> GetAllAsync()
        {
            using var conn = new SqlConnection(_connectionString);

            var sql = @"
                    select UserID,FName,LName,Email,JudgeLicense
                    from core.Users
                    where IsJudge = 1
                    order by LName,FName";

            return await conn.QueryAsync<JudgeUser>(sql);

        }

    }
}
