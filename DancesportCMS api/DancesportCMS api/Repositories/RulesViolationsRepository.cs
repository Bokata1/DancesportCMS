using DancesportCMS_api.Models;
using Dapper;
using Microsoft.Data.SqlClient;
using MongoDB.Driver;

namespace DancesportCMS_api.Repositories
{
    public class RulesViolationsRepository
    {
        private readonly MongoService _mongo;
        private readonly string _sqlConnectionString;
        private readonly IMongoCollection<RulesViolation> _violations;

        public RulesViolationsRepository(MongoService mongo, IConfiguration config)
        {
            _mongo = mongo;
            _sqlConnectionString = config.GetConnectionString("DancesportDB")!;
            _violations = mongo.GetCollection<RulesViolation>("RulesViolations");
        }

        public async Task<(bool success, string? error, bool isNowFlagged)> ToggleViolationAsync(ToggleViolationRequest request)
        {
            if (request.FlagType != "Costume" && request.FlagType != "Choreography")
                return (false, "Невалиден тип", false);

            if (request.FlagType == "Choreography" && request.DanceID == null)
                return (false, "Изберете танц за нарушения в хореографията", false);

            if (request.FlagType == "Costume" && request.DanceID != null)
                return (false, "Нарушенията за костюм се прилагат за целия кръг", false);

            using var conn = new SqlConnection(_sqlConnectionString);
            var judgeCheck = "select IsRulesJudge from core.Users where UserID = @userID";
            var isRulesJudge = await conn.ExecuteScalarAsync<bool?>(judgeCheck, new { userID = request.FlaggedBy });

            if (isRulesJudge != true)
                return (false, "Само съдия по ограничения може да маркира нарушения", false);

            FilterDefinition<RulesViolation> filter;
            if (request.FlagType == "Costume")
            {
                filter = Builders<RulesViolation>.Filter.And(
                    Builders<RulesViolation>.Filter.Eq(v => v.RoundID, request.RoundID),
                    Builders<RulesViolation>.Filter.Eq(v => v.RegistrationID, request.RegistrationID),
                    Builders<RulesViolation>.Filter.Eq(v => v.FlagType, "Costume")
                );
            }
            else
            {
                filter = Builders<RulesViolation>.Filter.And(
                    Builders<RulesViolation>.Filter.Eq(v => v.RoundID, request.RoundID),
                    Builders<RulesViolation>.Filter.Eq(v => v.RegistrationID, request.RegistrationID),
                    Builders<RulesViolation>.Filter.Eq(v => v.FlagType, "Choreography"),
                    Builders<RulesViolation>.Filter.Eq(v => v.DanceID, request.DanceID)
                );
            }

            var existing = await _violations.Find(filter).FirstOrDefaultAsync();

            if (existing is not null)
            {
                //  off 
                await _violations.DeleteOneAsync(filter);
                return (true, null, false);
            }
            else
            {
                // on 
                var violation = new RulesViolation
                {
                    TournamentID = request.TournamentID,
                    RoundID = request.RoundID,
                    CategoryID = request.CategoryID,
                    RegistrationID = request.RegistrationID,
                    FlagType = request.FlagType,
                    DanceID = request.DanceID,
                    FlaggedBy = request.FlaggedBy,
                    FlaggedAt = DateTime.UtcNow
                };
                await _violations.InsertOneAsync(violation);
                return (true, null, true);
            }
        }

        public async Task<RulesRoundView?> GetRoundViewAsync(long roundID)
        {
            using var conn = new SqlConnection(_sqlConnectionString);

            var headerSql = @"
                select r.RoundID, t.TournamentName,c.AgeGroup + case when c.Class is not null then ' ' + c.Class else '' end
                         + ' ' + c.DanceStyle as CategoryName
                from events.Rounds r
                    join events.Tournaments t on t.TournamentID = r.TournamentID
                    join core.Categories c on c.CategoryID = r.CategoryID
                where r.RoundID = @roundID";

            var round = await conn.QuerySingleOrDefaultAsync<RulesRoundView>(headerSql, new { roundID });
            if (round is null) return null;

            var dancesSql = @"
                select d.DanceID, d.Name as DanceName
                from events.Rounds r
                    join core.CategoryDances cd on cd.CategoryID = r.CategoryID
                    join core.Dances d on d.DanceID = cd.DanceID
                where r.RoundID = @roundID
                order by d.DanceID";

            var dances = (await conn.QueryAsync<DanceInfo>(dancesSql, new { roundID })).ToList();
            round.Dances = dances;

            // couples in  round
            var couplesSql = @"
                select tr.RegistrationID, tr.StartNumber,tr.RegPartner1Name + ' / ' + tr.RegPartner2Name as CoupleName,tr.RegClubName as ClubName
                from events.Rounds r
                join events.TournamentsRegistration tr on tr.TournamentID = r.TournamentID and tr.CategoryID = r.CategoryID
                where r.RoundID = @roundID
                order by tr.StartNumber";

            var couples = (await conn.QueryAsync<RulesViolationSummary>(couplesSql, new { roundID })).ToList();

            // violations from Mongo
            var filter = Builders<RulesViolation>.Filter.Eq(v => v.RoundID, roundID);
            var violations = await _violations.Find(filter).ToListAsync();

            //violatis to dancers
            foreach (var couple in couples)
            {
                couple.HasCostumeFlag = violations.Any(v =>
                    v.RegistrationID == couple.RegistrationID && v.FlagType == "Costume");

                couple.ChoreographyDanceIDs = violations
                    .Where(v => v.RegistrationID == couple.RegistrationID && v.FlagType == "Choreography" && v.DanceID.HasValue)
                    .Select(v => v.DanceID!.Value)
                    .ToList();
            }

            round.Couples = couples;

            return round;
        }
    }
}