using Dapper;
using DancesportCMS_api;
using Microsoft.Data.SqlClient;

using DancesportCMS_api.Models;



namespace DancesportCMS_api.Repositories
{
    public class TournamentRepository
    {
        private readonly string _connectionString;

        public TournamentRepository(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DancesportDB")!;
        }

        public async Task <IEnumerable <Tournament>>GetAllAsync()
        {
            using var conn = new SqlConnection(_connectionString);

            var sql = @"
                    select TournamentID, TournamentName, TournamentDate,Location, IsRegistrationOpen, IsFinished
                    from events.Tournaments
                    order by TournamentDate desc";

            return await conn.QueryAsync<Tournament> (sql);

        }

        public async Task<Tournament?> GetByIdAsync (long id)
        {
            using var conn = new SqlConnection(_connectionString);
            var sql = @"
                    select TournamentID, TournamentName, TournamentDate,Location, IsRegistrationOpen, IsFinished
                    from events.Tournaments
                    where TournamentID = @id";
                
                return await conn.QuerySingleOrDefaultAsync<Tournament?> (sql,new {id});
        }


    }
}
