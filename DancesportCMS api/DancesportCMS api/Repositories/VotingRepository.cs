using DancesportCMS_api.Models;
using Dapper;
using Microsoft.Data.SqlClient;
using MongoDB.Driver;

namespace DancesportCMS_api.Repositories
{
    public class VotingRepository
    {
        private readonly MongoService _mongo;
        private readonly string _sqlConnectionString;
        private readonly IMongoCollection<PublicVote> _votes;

        public VotingRepository(MongoService mongo, IConfiguration config)
        {
            _mongo = mongo;
            _sqlConnectionString = config.GetConnectionString("DancesportDB")!;
            _votes = mongo.GetCollection<PublicVote>("PublicVotes");
        }

        public async Task<(bool success, string? error)> CastVoteAsync(CastVoteRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.VoterFingerprint))
                return (false, "Липсва идентификатор на гласуващия");

            using var conn = new SqlConnection(_sqlConnectionString);
                    var verifySql = @"
                        select count(*) from events.TournamentsRegistration
                        where RegistrationID = @registrationID
                          and TournamentID = @tournamentID
                          and CategoryID = @categoryID";

            var exists = await conn.ExecuteScalarAsync<int>(verifySql, new
            {
                registrationID = request.RegistrationID,
                tournamentID = request.TournamentID,
                categoryID = request.CategoryID
            });

            if (exists == 0)
                return (false, "Невалидна двойка за тази категория");

            var existingFilter = Builders<PublicVote>.Filter.And(
                Builders<PublicVote>.Filter.Eq(v => v.TournamentID, request.TournamentID),
                Builders<PublicVote>.Filter.Eq(v => v.CategoryID, request.CategoryID),
                Builders<PublicVote>.Filter.Eq(v => v.VoterFingerprint, request.VoterFingerprint)
            );

            var alreadyVoted = await _votes.Find(existingFilter).AnyAsync();

            if (alreadyVoted)
                return (false, "Вече сте гласували в тази категория");

            var vote = new PublicVote
            {
                TournamentID = request.TournamentID,
                CategoryID = request.CategoryID,
                RegistrationID = request.RegistrationID,
                VoterFingerprint = request.VoterFingerprint,
                VotedAt = DateTime.UtcNow
            };

            await _votes.InsertOneAsync(vote);

            return (true, null);
        }

        public async Task<VoteResultsOverview?> GetResultsAsync(long tournamentID, long categoryID)
        {
            using var conn = new SqlConnection(_sqlConnectionString);

            var headerSql = @"
                select t.TournamentName,c.AgeGroup + case when c.Class is not null then ' ' + c.Class else '' end + ' ' + c.DanceStyle as CategoryName
                from events.Tournaments t, core.Categories c
                where t.TournamentID = @tournamentID and c.CategoryID = @categoryID";

            var header = await conn.QuerySingleOrDefaultAsync<dynamic>(headerSql, new
            {
                tournamentID,
                categoryID
            });

            if (header is null) return null;

                var couplesSql = @"
                    select RegistrationID, StartNumber,RegPartner1Name + ' / ' + RegPartner2Name as CoupleName,RegClubName as ClubName
                    from events.TournamentsRegistration
                    where TournamentID = @tournamentID
                      and CategoryID = @categoryID
                    order by StartNumber";

            var couples = (await conn.QueryAsync<dynamic>(couplesSql, new
            {
                tournamentID,
                categoryID
            })).ToList();

            var voteFilter = Builders<PublicVote>.Filter.And(
                Builders<PublicVote>.Filter.Eq(v => v.TournamentID, tournamentID),
                Builders<PublicVote>.Filter.Eq(v => v.CategoryID, categoryID)
            );

            var allVotes = await _votes.Find(voteFilter).ToListAsync();
            var totalVotes = allVotes.Count;

            var voteCounts = allVotes
                .GroupBy(v => v.RegistrationID)
                .ToDictionary(g => g.Key, g => g.Count());

            var results = couples.Select(c =>
            {
                var registrationID = (long)c.RegistrationID;
                var count = voteCounts.GetValueOrDefault(registrationID, 0);
                return new VoteResult
                {
                    RegistrationID = registrationID,
                    StartNumber = (int)c.StartNumber,
                    CoupleName = (string)c.CoupleName,
                    ClubName = (string)c.ClubName,
                    VoteCount = count,
                    Percentage = totalVotes > 0 ? Math.Round((count * 100.0) / totalVotes, 1) : 0
                };
            }).OrderByDescending(r => r.VoteCount).ToList();

            return new VoteResultsOverview
            {
                TournamentName = (string)header.TournamentName,
                CategoryName = (string)header.CategoryName,
                TotalVotes = totalVotes,
                Results = results
            };
        }

        public async Task<List<VotableCouple>> GetVotableCouplesAsync(long tournamentID, long categoryID)
        {
            using var conn = new SqlConnection(_sqlConnectionString);

            var sql = @"
                    select RegistrationID, StartNumber,
                           RegPartner1Name + ' / ' + RegPartner2Name as CoupleName,
                           RegClubName as ClubName
                    from events.TournamentsRegistration
                    where TournamentID = @tournamentID
                      and CategoryID = @categoryID
                    order by StartNumber";

            var couples = await conn.QueryAsync<VotableCouple>(sql, new
            {
                tournamentID,
                categoryID
            });

            return couples.ToList();
        }
    }
}
