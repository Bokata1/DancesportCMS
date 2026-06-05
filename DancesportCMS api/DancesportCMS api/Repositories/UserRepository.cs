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
                    select UserID,FName,LName,Email,JudgeLicense,IsRulesJudge
                    from core.Users
                    where IsJudge = 1
                    order by LName,FName";

            return await conn.QueryAsync<JudgeUser>(sql);

        }
        public async Task<JudgeSession?> AuthenticateByPINAsync(string pin)
        {
            using var conn = new SqlConnection(_connectionString);

            var userSql = @"
                select UserID,FName,LName,JudgeLicense,IsRulesJudge
                from core.Users
                where IsJudge = 1
                  and JudgePIN = @pin";

            var session = await conn.QuerySingleOrDefaultAsync<JudgeSession>(userSql, new { pin });

            if (session is null) return null;
                        var roundsSql = @"
                select r.RoundID, r.TournamentID, t.TournamentName,
                       c.AgeGroup + ' ' + c.DanceStyle
                         + case when c.Class is not null then ' ' + c.Class else '' end as CategoryName,
                       r.RoundType
                        from judging.JudgePanelAssignments jpa
                        join events.Rounds r on r.RoundID = jpa.RoundID
                        join events.Tournaments t on t.TournamentID = r.TournamentID
                        join core.Categories c on c.CategoryID = r.CategoryID
                        where jpa.UserID = @userID
                          and r.Status = 'AC'
                           and exists 
                            (select 1 
                            from core.CategoryDances cd
                              where cd.CategoryID = r.CategoryID
                                    and not exists (select 1 
                                from judging.Marks m 
                                where m.RoundID = r.RoundID 
                                and m.DanceID=cd.DanceID
                                and m.UserID=@userID))
                        order  by t.TournamentDate desc, r.RoundNumber";

            var rounds = await conn.QueryAsync<ActiveRoundForJudge>(roundsSql, new { userID = session.UserID });
            session.ActiveRounds = rounds.ToList();

            return session;
        }

        public async Task<UserSession?> LoginAsync(string email,string password)
        {
            using var conn = new SqlConnection(_connectionString);
            var sql = @"select UserID,Fname,LName,Email,IsAdmin,IsJudge,IsUser,JudgeLicense
                        from core.Users
                        where Email =@email
                         and Password = @password";
            return await conn.QuerySingleOrDefaultAsync<UserSession>(sql, new { email, password });

        }
        public async Task<IEnumerable<ActiveRoundForJudge>> GetActiveRoundsForJudgeAsync(long userID)
        {
            using var conn = new SqlConnection(_connectionString);

            var sql = @"
                        select r.RoundID, r.TournamentID, t.TournamentName,
                               c.AgeGroup + case when c.Class is not null then ' ' + c.Class else '' end + ' ' + c.DanceStyle as CategoryName,
                               r.RoundType
                        from judging.JudgePanelAssignments jpa
                        join events.Rounds r on r.RoundID = jpa.RoundID
                        join events.Tournaments t on t.TournamentID = r.TournamentID
                        join core.Categories c on c.CategoryID = r.CategoryID
                        where jpa.UserID = @userID
                          and r.Status = 'AC'
                          and exists (
                                select 1
                                from core.CategoryDances cd
                                where cd.CategoryID = r.CategoryID
                                  and not exists (
                                        select 1
                                        from judging.Marks m
                                        where m.RoundID = r.RoundID
                                          and m.DanceID= cd.DanceID
                                          and m.UserID = jpa.UserID
                                  )
                          )
                        order by t.TournamentDate desc,r.RoundNumber";

            return await conn.QueryAsync<ActiveRoundForJudge>(sql, new { userID });
        }
    }
}
