using DancesportCMS_api;
using DancesportCMS_api.Models;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using System.Security.Claims;



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

        public async Task <TournamentDetail?> GetDetailAsync (long id)
        {
            using var conn = new SqlConnection(_connectionString);

            var tournamentSql = @"
                    select TournamentID,TournamentName,TournamentDate,Location,IsRegistrationOpen,IsFinished
                    from events.Tournaments
                    where TournamentID = @id";

            var tournament = await conn.QuerySingleOrDefaultAsync<TournamentDetail>(tournamentSql, new { id });

            if (tournament is null) return null;

                    var roundsSql = @"select r.RoundID, r.CategoryID,c.AgeGroup
                      + case when c.Class is not null then ' ' + c.Class else '' end
                      + ' ' + c.DanceStyle as CategoryName,
                       r.RoundType, r.RoundNumber, r.Status,
                       (select count(distinct RegistrationID)
                        from judging.Marks m
                        where m.RoundID = r.RoundID) as CoupleCount
                        from events.Rounds r
                        join core.Categories c on c.CategoryID = r.CategoryID
                        where r.TournamentID = @id
                        order by c.AgeGroup, c.DanceStyle, r.RoundNumber";  

            var rounds = await conn.QueryAsync<RoundSummary>(roundsSql, new { id });
            tournament.Rounds = rounds.ToList();

            var judgesSql = @"
                    select distinct u.UserID, u.FName, u.LName, u.Email, u.JudgeLicense, u.IsRulesJudge
                    from core.Users u
                    join judging.JudgePanelAssignments jpa on jpa.UserID = u.UserID
                    join events.Rounds r on r.RoundID = jpa.RoundID
                    where r.TournamentID = @id
                    order by u.LName, u.FName";

            var judges = await conn.QueryAsync<JudgeUser>(judgesSql, new { id });
            tournament.Judges = judges.ToList();

            return tournament;


        }
        public async Task<SkatingSheet?> GetSkatingSheetAsync(long roundID)
        {
            using var conn = new SqlConnection(_connectionString);

            //round info
                        var headerSql = @"
                    select r.RoundID, t.TournamentName,c.AgeGroup
                          + case when c.Class is not null then ' ' + c.Class else '' end
                          + ' ' + c.DanceStyle as CategoryName,
                           r.RoundType
                    from events.Rounds r
                    join events.Tournaments t on t.TournamentID = r.TournamentID
                    join core.Categories c on c.CategoryID = r.CategoryID
                    where r.RoundID = @roundID";

            var sheet = await conn.QuerySingleOrDefaultAsync<SkatingSheet>(headerSql, new { roundID });
            if (sheet is null) return null;

                        var dancesSql = @"
                    select distinct d.DanceID, d.Name as DanceName
                    from events.Rounds r
                    join core.CategoryDances cd on cd.CategoryID = r.CategoryID
                    join core.Dances d on d.DanceID = cd.DanceID
                    where r.RoundID = @roundID
                    order by d.DanceID";

            var dances = (await conn.QueryAsync<DanceSheet>(dancesSql, new { roundID })).ToList();

                    var judgesSql = @"
                select jpa.UserID,
                       char(64 + row_number() over (order by u.LName, u.FName)) as DisplayCode
                from judging.JudgePanelAssignments jpa
                join core.Users u on u.UserID = jpa.UserID
                where jpa.RoundID = @roundID
                      and u.IsRulesJudge = 0
                order by u.LName, u.FName";

            var judges = (await conn.QueryAsync<JudgeColumn>(judgesSql, new { roundID })).ToList();

                    var marksSql = @"
                    select m.DanceID, m.RegistrationID, tr.StartNumber,
                           m.UserID, m.MarkValue,
                           dp.DancePlacement
                    from judging.Marks m
                    join events.TournamentsRegistration tr on tr.RegistrationID = m.RegistrationID
                    left join judging.DancePlacements dp
                           on dp.RoundID = m.RoundID
                          and dp.DanceID = m.DanceID
                          and dp.RegistrationID = m.RegistrationID
                    where  m.RoundID = @roundID
                    order  by m.DanceID, tr.StartNumber";

            var allMarks = (await conn.QueryAsync<dynamic>(marksSql, new { roundID })).ToList();

            foreach (var dance in dances)
            {
                dance.Judges = judges;

                var marksForThisDance = allMarks
                    .Where(m => (long)m.DanceID == dance.DanceID)
                    .ToList();

                var coupleGroups = marksForThisDance
                    .GroupBy(m => (long)m.RegistrationID);

                foreach (var group in coupleGroups)
                {
                    var firstRow = group.First();
                    var couple = new CoupleDanceRow
                    {
                        RegistrationID = (long)firstRow.RegistrationID,
                        StartNumber = (int)firstRow.StartNumber,
                        DancePlacement = firstRow.DancePlacement ?? 0,
                        Marks = new List<int>()
                    };

                    foreach (var judge in judges)
                    {
                        var markRow = group.FirstOrDefault(m => (long)m.UserID == judge.UserID);
                        int markValue = 0;
                        if (markRow is not null && markRow.MarkValue is not null)
                        {
                            markValue = (int)markRow.MarkValue;
                        }
                        couple.Marks.Add(markValue);
                    }

                    couple.Sum = couple.Marks.Sum();
                    dance.Couples.Add(couple);
                }

                dance.Couples = dance.Couples.OrderBy(c => c.DancePlacement).ThenBy(c => c.StartNumber).ToList();
            }

            sheet.Dances = dances;

                    var finalSql = @"
                        select res.RegistrationID, tr.StartNumber,
                               tr.RegPartner1Name + ' / ' + tr.RegPartner2Name as PartnerNames,
                               (select sum(dp.DancePlacement)
                                from judging.DancePlacements dp
                                where dp.RoundID = res.RoundID
                                  and dp.RegistrationID = res.RegistrationID) as TotalSum,
                               res.FinalPlace
                        from   judging.Results res
                        join   events.TournamentsRegistration tr on tr.RegistrationID = res.RegistrationID
                        where  res.RoundID = @roundID
                        order  by res.FinalPlace, tr.StartNumber";

            var results = await conn.QueryAsync<FinalResultRow>(finalSql, new { roundID });
            sheet.FinalResults = results.ToList();

            return sheet;
        }
        public async Task<RoundForJudging?> GetRoundForJudgingAsync(long roundID)
        {
            using var conn = new SqlConnection(_connectionString);

                        var headerSql = @"
                        select r.RoundID, t.TournamentName,c.AgeGroup
                                  + case when c.Class is not null then ' ' + c.Class else '' end
                                  + ' ' + c.DanceStyle as CategoryName,
                               r.RoundType, r.Status, r.CouplesToAdvance
                        from events.Rounds r
                        join events.Tournaments t on t.TournamentID = r.TournamentID
                        join core.Categories c on c.CategoryID = r.CategoryID
                        where r.RoundID = @roundID";

                            var round = await conn.QuerySingleOrDefaultAsync<RoundForJudging>(headerSql, new { roundID });
            if (round is null) return null;

                                        var couplesSql = @"
                                select tr.RegistrationID, tr.StartNumber,
                                       he_h.HeatNumber
                                from events.Rounds r
                                join events.TournamentsRegistration tr
                                       on  tr.TournamentID = r.TournamentID
                                       and tr.CategoryID = r.CategoryID
                                left join events.HeatsEnties he on he.RegistrationID = tr.RegistrationID
                                left join events.Heats he_h on he_h.HeatID = he.HeatID and he_h.RoundId = r.RoundID
                                where  r.RoundID = @roundID
                                  and  (
                                    not exists (
                                        select 1 from events.Rounds prev
                                        where prev.TournamentID = r.TournamentID
                                          and prev.CategoryID = r.CategoryID
                                          and prev.RoundNumber < r.RoundNumber
                                    )
                                    or
                                    exists (
                                        select 1
                                        from events.Rounds prev
                                        join judging.RoundAdvancements ra on ra.RoundID = prev.RoundID
                                        where prev.TournamentID= r.TournamentID
                                          and prev.CategoryID = r.CategoryID
                                          and prev.RoundNumber = r.RoundNumber - 1
                                          and ra.RegistrationID = tr.RegistrationID
                                          and ra.Advanced = 1
                                    )
                                  )
                                order by he_h.HeatNumber, tr.StartNumber";


            var couples = await conn.QueryAsync<RoundCouple>(couplesSql, new { roundID });
                round.Couples = couples.ToList();

                            var dancesSql = @"
                                select d.DanceID, d.Name as DanceName,
                                       row_number() over (order by d.DanceID) as DanceOrder
                                from events.Rounds r
                                join core.CategoryDances cd on cd.CategoryID = r.CategoryID
                                join core.Dances d on d.DanceID = cd.DanceID
                                where r.RoundID = @roundID
                                order by d.DanceID";

            var dances = await conn.QueryAsync<RoundDance>(dancesSql, new { roundID });
            round.Dances = dances.ToList();

            return round;
        }
        public  async Task <(bool success,string? error)>SubmitMarksAsync(MarkSubmissionRequest request)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            //judge reg check

            var judgeSql = @"select count(*) from core.Users where UserID =@userID and isJudge = 1 and JudgePIN =@pin";

            var judgeOk = await conn.ExecuteScalarAsync<int>(judgeSql, new { userID = request.JudgeUserID, pin = request.PIN });

            if (judgeOk == 0)
                return (false, "Невалидни данни");
                    var panelSql = @"
                        select count(*)
                        from judging.JudgePanelAssignments
                        where RoundID = @roundID
                          and UserID = @userID";

                var panelOk = await conn.ExecuteScalarAsync<int>(panelSql, new
                {
                    roundID = request.RoundID,
                    userID = request.JudgeUserID
                });

            if (panelOk == 0)
                return (false, "Не сте назначен за този кръг");

                        var roundSql = @"
                                        select Status
                                        from events.Rounds
                                        where RoundID = @roundID";
            var status = await conn.ExecuteScalarAsync<string>(roundSql, new { roundID = request.RoundID });

                    if (status != "AC")
                        return (false, "Неактивен кръг");
            var existingSql = @"
                            select count(*)
                            from judging.Marks
                            where RoundID = @roundID
                              and DanceID = @danceID
                              and UserID = @userID";

            var alreadyMarked = await conn.ExecuteScalarAsync<int>(existingSql, new
            {
                roundID = request.RoundID,
                danceID = request.DanceID,
                userID = request.JudgeUserID
            });

            if (alreadyMarked > 0)
                return (false, "Танца вече е оценен. Промяна не е възможна.");

            // inserts
            //  round type check
                var roundTypeSql = "select RoundType from events.Rounds where RoundID = @roundID";
                var roundType = await conn.ExecuteScalarAsync<string>(roundTypeSql, new { roundID = request.RoundID });
                var isQualifying = roundType != "FN";

                    var insertSql = @"
                insert into judging.Marks (RoundID,DanceID,UserID,RegistrationID,IsCross,MarkValue)
                values (@RoundID, @DanceID,@UserID, @RegistrationID,@IsCross,@MarkValue)";

            foreach (var m in request.Marks)
            {
                await conn.ExecuteAsync(insertSql, new
                {
                    RoundID = request.RoundID,
                    DanceID = request.DanceID,
                    UserID = request.JudgeUserID,
                    RegistrationID = m.RegistrationID,
                    IsCross = isQualifying ? (bool?)true : false,
                    MarkValue = isQualifying ? (int?)null : m.MarkValue
                });
            }


            return (true, null);
        }
        public async Task<(bool success, string? error)> FinalizeTournamentAsync(long tournamentID)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var checkSql = "select IsFinished from events.Tournaments where TournamentID = @tournamentID";
            var isFinished = await conn.QuerySingleOrDefaultAsync<bool?>(checkSql, new { tournamentID });

            if (isFinished is null)
                return (false, "Турнирът не съществува");

            if (isFinished == true)
                return (false, "Турнирът вече е приключил");

                var unfinishedSql = @"
                    select count(*)
                    from judging.JudgePanelAssignments jpa
                    cross join core.CategoryDances cd
                    join events.Rounds r on r.RoundID = jpa.RoundID
                    join core.Users u on u.UserID = jpa.UserID
                    where r.TournamentID = @tournamentID
                      and r.Status = 'AC'
                      and u.IsRulesJudge = 0
                      and cd.CategoryID = r.CategoryID
                      and not exists (
                            select 1 from judging.Marks m
                            where m.RoundID = jpa.RoundID
                              and m.UserID = jpa.UserID
                              and m.DanceID = cd.DanceID
                      )";

            var unfinished = await conn.ExecuteScalarAsync<int>(unfinishedSql, new { tournamentID });

            if (unfinished > 0)
                return (false, $"Има {unfinished} непопълнени съдийски листи в активните кръгове. Изчакайте съдиите да приключат.");

            try
            {
                await conn.ExecuteAsync(
                    "judging.sp_finalize_tournament",
                    new { p_TournamentID = tournamentID },
                    commandType: System.Data.CommandType.StoredProcedure
                );
                return (true, null);
            }
            catch (Exception ex)
            {
                return (false, $"Грешка при финализиране: {ex.Message}");
            }
        }
        public async Task <RoundProgress?> GetRoundProgressAsync(long roundID)
        {
            using var conn = new SqlConnection(_connectionString);

                    var headerSql = @"
                        select r.RoundID, r.TournamentID,t.TournamentName,c.AgeGroup
                                  + case when c.Class is not null then ' ' + c.Class else '' end
                                  + ' ' + c.DanceStyle as CategoryName,
                               r.RoundType, r.Status
                        from events.Rounds r
                        join events.Tournaments t on t.TournamentID = r.TournamentID
                        join core.Categories c on c.CategoryID   = r.CategoryID
                        where r.RoundID = @roundID";

            var progress = await conn.QuerySingleOrDefaultAsync<RoundProgress>(headerSql, new { roundID });
            if (progress is null) return null;

                        var dancesSql = @"
                                select d.DanceID, d.Name as DanceName
                                from events.Rounds r
                                join core.CategoryDances cd on cd.CategoryID = r.CategoryID
                                join core.Dances d on d.DanceID = cd.DanceID
                                where r.RoundID = @roundID
                                order by d.DanceID";

            var dances = (await conn.QueryAsync<DanceInfo>(dancesSql, new { roundID })).ToList();
            progress.Dances = dances;
            progress.TotalDances = dances.Count;

           
                            var judgesSql = @"
                        select u.UserID, u.FName + ' ' + u.LName as Name,
                               u.JudgeLicense,u.IsRulesJudge
                        from judging.JudgePanelAssignments jpa
                        join core.Users u on u.UserID = jpa.UserID
                        where jpa.RoundID = @roundID
                        order by u.LName, u.FName";

            var judges = (await conn.QueryAsync<JudgeProgress>(judgesSql, new { roundID })).ToList();
            progress.TotalJudges = judges.Count(j => !j.IsRulesJudge);

                    var couplesSql = @"
                            select count(*)
                            from events.Rounds r
                            join events.TournamentsRegistration tr
                                   on tr.TournamentID = r.TournamentID
                                   and tr.CategoryID = r.CategoryID
                            where  r.RoundID = @roundID";

            progress.TotalCouples = await conn.ExecuteScalarAsync<int>(couplesSql, new { roundID });

                    var marksSql = @"
                        select UserID, DanceID, count(*) as MarkCount
                        from judging.Marks
                        where RoundID = @roundID
                        group by UserID, DanceID";

            var marks = (await conn.QueryAsync<dynamic>(marksSql, new { roundID })).ToList();

            foreach (var judge in judges)
            {
                foreach (var dance in dances)
                {
                    var hasMarks = marks.Any(m =>
                        (long)m.UserID == judge.UserID &&
                        (long)m.DanceID == dance.DanceID);

                    judge.DanceStatuses.Add(new DanceStatus
                    {
                        DanceID = dance.DanceID,
                        DanceName = dance.DanceName,
                        IsSubmitted = hasMarks
                    });
                }
            }

            progress.Judges = judges;

            
            progress.TotalMarksExpected = progress.TotalJudges * progress.TotalDances * progress.TotalCouples;
            progress.TotalMarksReceived = marks.Sum(m => (int)m.MarkCount);

            return progress;
        }

            public async Task<long> CreateTournamentAsync (CreateTournamentRequest request)
            {
                using var conn = new SqlConnection(_connectionString);
                
                var sql = @"insert into events.Tournaments
                            (TournamentName, TournamentDate, Location, IsRegistrationOpen, IsFinished)
                              output inserted.TournamentID
                                    values (@TournamentName, @TournamentDate, @Location, 0, 0)";
                    return await conn.ExecuteScalarAsync<long>(sql, request);
            }
        public async Task <(bool success,string? error)> SetRegistrationOpenAsync (long tournamentID, bool isOpen)
        {
            using var conn = new SqlConnection(_connectionString);
                    var sql = @"
                        update events.Tournaments
                        set IsRegistrationOpen = @isOpen
                        where TournamentID = @tournamentID
                          and IsFinished = 0";

                var affected = await conn.ExecuteAsync(sql, new { tournamentID, isOpen });

                if (affected == 0)
                    return (false, "Турнирът не съществува или вече е приключил");

                return (true, null);
        }
        public async Task<(bool success, string? error)> SetRoundStatusAsync(long roundID, string status)
        {
            var validStatuses = new[] { "PN", "AC", "CL" };
            if (!validStatuses.Contains(status))
                return (false, "Невалиден статус. Допустими: PN, AC, CL");

            using var conn = new SqlConnection(_connectionString);

            var currentSql = "select Status from events.Rounds where RoundID = @roundID";
            var current = await conn.ExecuteScalarAsync<string>(currentSql, new { roundID });

            if (current is null)
                return (false, "Кръгът не съществува");

            var valid = (current, status) switch
            {
                ("PN","AC") => true, 
                ("AC", "PN") => true, 
                ("AC", "CL") => true,
                ("CL", "AC") => true,
                _ => false
            };

            if (!valid)
                return (false, $"Преходът {current} → {status} не е позволен");

                        var updateSql = @"
                            update events.Rounds
                            set Status = @status
                            where RoundID = @roundID";

            await conn.ExecuteAsync(updateSql, new { roundID, status });

            return (true, null);
        }
        public async Task<(bool success, string? error)> FinalizeRoundAsync(long roundID)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var statusSql = "select Status from events.Rounds where RoundID = @roundID";
            var status = await conn.ExecuteScalarAsync<string>(statusSql, new { roundID });

            if (status is null)
                return (false, "Кръгът не съществува");

            if (status != "AC")
                return (false, "Само АКТИВНИ кръгове могат да бъдат финализирани");

                    var unfinishedSql = @"
                    select count(*)
                    from judging.JudgePanelAssignments jpa
                    cross join core.CategoryDances cd
                    join events.Rounds r on r.RoundID = jpa.RoundID
                    join core.Users u on u.UserID = jpa.UserID
                    where jpa.RoundID = @roundID
                            and u.IsRulesJudge = 0
                            and cd.CategoryID = r.CategoryID
                            and not exists (
                            select 1 from judging.Marks m
                            where m.RoundID = jpa.RoundID
                              and m.UserID = jpa.UserID
                              and m.DanceID = cd.DanceID
                                    )";

            var unfinished = await conn.ExecuteScalarAsync<int>(unfinishedSql, new { roundID });

            if (unfinished > 0)
                return (false, $"Има {unfinished} непопълнен съдийски листи. Изчакайте всички съдии да приключат.");

            var roundTypeSql = "select RoundType from events.Rounds where RoundID = @roundID";
            var roundType = await conn.ExecuteScalarAsync<string>(roundTypeSql, new { roundID });

            using var transaction = conn.BeginTransaction();
            try
            {
                if (roundType == "FN")
                {
                    await conn.ExecuteAsync(
                        "judging.sp_calculate_skating",
                        new { p_RoundID = roundID },
                        transaction: transaction,
                        commandType: System.Data.CommandType.StoredProcedure
                    );
                }
                else
                {
                    await conn.ExecuteAsync(
                        "judging.sp_advance_from_crosses",
                        new { p_RoundID = roundID },
                        transaction: transaction,
                        commandType: System.Data.CommandType.StoredProcedure
                    );
                }

                await conn.ExecuteAsync(
                    "update events.Rounds set Status = 'CL' where RoundID = @roundID",
                    new { roundID },
                    transaction: transaction
                );

                transaction.Commit();
                return (true, null);
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Грешка при изчисляване: {ex.Message}");
            }
        }
        public async Task<IEnumerable<Tournament>> GetOpenForRegistrationAsync()
        {
            using var conn = new SqlConnection(_connectionString);

            
                    var sql = @"
                    select TournamentID, TournamentName, TournamentDate, Location,IsRegistrationOpen,IsFinished
                    from events.Tournaments
                    where IsRegistrationOpen = 1
                      and IsFinished = 0 
                    order by TournamentDate";

            return await conn.QueryAsync<Tournament>(sql);
        }

        public async Task<(bool success, string? error, long? roundID)> AddRoundAsync(AddRoundRequest request)
        {
            var validTypes = new[] { "QL", "QF", "SF", "FN" };
            if (!validTypes.Contains(request.RoundType))
                return (false, "Невалиден тип кръг. Допустими: QL, QF, SF, FN", null);

            if (request.RoundType != "FN" && (request.CouplesToAdvance == null || request.CouplesToAdvance <= 0))
                return (false, "Полето 'двойки за продължаване' е задължително за нефинални кръгове", null);

            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var tournamentCheckSql = "select IsFinished from events.Tournaments where TournamentID = @tournamentID";
            var tournament = await conn.QuerySingleOrDefaultAsync<dynamic>(tournamentCheckSql, new { tournamentID = request.TournamentID });

            if (tournament is null)
                return (false, "Турнирът не съществува", null);

            if ((bool)tournament.IsFinished)
                return (false, "Турнирът е приключил", null);

            var categoryCheckSql = "select count(*) from core.Categories where CategoryID = @categoryID";
            var categoryExists = await conn.ExecuteScalarAsync<int>(categoryCheckSql, new { categoryID = request.CategoryID });

            if (categoryExists == 0)
                return (false, "Категорията не съществува", null);

                var duplicateCheckSql = @"
                select count(*) from events.Rounds
                where TournamentID = @tournamentID
                 and CategoryID = @categoryID
                and RoundType = @roundType";

            var duplicate = await conn.ExecuteScalarAsync<int>(duplicateCheckSql, new
            {
                tournamentID = request.TournamentID,
                categoryID = request.CategoryID,
                roundType = request.RoundType
            });

            if (duplicate > 0)
                return (false, $"Кръг {request.RoundType} вече съществува за тази категория", null);

            var roundNumberSql = @"
                select isnull(max(RoundNumber), 0) + 1
                from events.Rounds
                where TournamentID = @tournamentID
                and CategoryID = @categoryID";

            var nextRoundNumber = await conn.ExecuteScalarAsync<int>(roundNumberSql, new
            {
                tournamentID = request.TournamentID,
                categoryID = request.CategoryID
            });

            var insertSql = @"
                 insert into events.Rounds
                (TournamentID, CategoryID, RoundType, RoundNumber, Status, CouplesToAdvance, CreatedAt)
                output inserted.RoundID
                values (@TournamentID, @CategoryID, @RoundType, @RoundNumber, 'PN', @CouplesToAdvance, sysdatetime())";

            var roundID = await conn.ExecuteScalarAsync<long>(insertSql, new
            {
                TournamentID = request.TournamentID,
                CategoryID = request.CategoryID,
                RoundType = request.RoundType,
                RoundNumber = nextRoundNumber,
                CouplesToAdvance = request.CouplesToAdvance
            });

            return (true, null, roundID);
        }

        public async Task<(bool success, string? error)> AssignJudgesToRoundAsync(long roundID, List<long> judgeUserIDs)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var roundCheckSql = "select Status from events.Rounds where RoundID = @roundID";
            var status = await conn.ExecuteScalarAsync<string>(roundCheckSql, new { roundID });

            if (status is null)
                return (false, "Кръгът не съществува");

            if (status == "CL")
                return (false, "Не можете да променяте съдии за приключил кръг");

            var judgesCheckSql = @"
                select count(*) from core.Users
                where UserID in @userIDs and IsJudge = 1";

            var judgesFound = await conn.ExecuteScalarAsync<int>(judgesCheckSql, new
            {
                userIDs = judgeUserIDs
            });

            if (judgesFound != judgeUserIDs.Count)
                return (false, "Един или повече от избраните потребители не са съдии");

            var deleteSql = "delete from judging.JudgePanelAssignments where RoundID = @roundID";
            await conn.ExecuteAsync(deleteSql, new { roundID });

                var insertSql = @"
                insert into judging.JudgePanelAssignments (RoundID, UserID)
                values (@RoundID, @UserID)";

            foreach (var userID in judgeUserIDs)
            {
                await conn.ExecuteAsync(insertSql, new { RoundID = roundID, UserID = userID });
            }

            return (true, null);
        }



        public async Task<(bool success, string? error, List<long>? registrationIDs)> RegisterCoupleAsync(CoupleRegistrationRequest request)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var tournamentSql = @"
                select IsRegistrationOpen, IsFinished
                from events.Tournaments
                where TournamentID = @tournamentID";

            var tournament = await conn.QuerySingleOrDefaultAsync<dynamic>(tournamentSql, new
            {
                tournamentID = request.TournamentID
            });

            if (tournament is null)
                return (false, "Турнирът не съществува", null);

            if ((bool)tournament.IsFinished)
                return (false, "Турнирът е приключил", null);

            if (!(bool)tournament.IsRegistrationOpen)
                return (false, "Регистрацията за този турнир е затворена", null);

            if (request.CategoryIDs == null || request.CategoryIDs.Count == 0)
                return (false, "Изберете поне една категория", null);

            var categoryCheckSql = @"
                select count(*) from core.Categories
                where CategoryID in @categoryIDs";

            var categoriesFound = await conn.ExecuteScalarAsync<int>(categoryCheckSql, new
            {
                categoryIDs = request.CategoryIDs
            });

            if (categoriesFound != request.CategoryIDs.Count)
                return (false, "Една или повече категории не съществуват", null);

            var registrationIDs = new List<long>();
            var insertSql = @"
                insert into events.TournamentsRegistration
                       (TournamentID, CategoryID, FederationID, StartNumber,
                        RegPartner1Name, RegPartner2Name, RegClubName,
                        HadPaidFee, IsCheckedIn, IsDisqualified, RegisteredAt)
                output inserted.RegistrationID
                values (@TournamentID, @CategoryID, null, @StartNumber,
                        @Partner1Name, @Partner2Name, @ClubName, 0, 0, 0, sysdatetime())";

            
            //fix 1 start number per tournament not per cat 
            
            var startNumberSql = @"
                    select isnull(max(StartNumber), 0) + 1
                    from events.TournamentsRegistration
                    where TournamentID = @tournamentID ";

            var nextStartNumber = await conn.ExecuteScalarAsync<long>(startNumberSql, new
            {
                tournamentID = request.TournamentID

            });


            foreach (var categoryID in request.CategoryIDs)
            {
                

                var registrationID = await conn.ExecuteScalarAsync<long>(insertSql, new
                {
                    TournamentID = request.TournamentID,
                    CategoryID = categoryID,
                    StartNumber = nextStartNumber,
                    Partner1Name = request.Partner1Name,
                    Partner2Name = request.Partner2Name,
                    ClubName = request.ClubName
                });

                registrationIDs.Add(registrationID);
            }

            return (true, null, registrationIDs);
        }
        public async Task<QualifyingSheet?> GetQualifyingSheetAsync(long roundID)
        {
            using var conn = new SqlConnection(_connectionString);

                    var headerSql = @"
                        select r.RoundID, t.TournamentName,c.AgeGroup
                                 + case when c.Class is not null then ' ' + c.Class else '' end
                                 + ' ' + c.DanceStyle as CategoryName,
                               r.RoundType, r.CouplesToAdvance
                        from events.Rounds r
                        join events.Tournaments t on t.TournamentID = r.TournamentID
                        join core.Categories c on c.CategoryID = r.CategoryID
                        where r.RoundID = @roundID";

            var sheet = await conn.QuerySingleOrDefaultAsync<QualifyingSheet>(headerSql, new { roundID });
            if (sheet is null) return null;

                     var dancesSql = @"
                    select d.DanceID, d.Name as DanceName
                    from events.Rounds r
                    join core.CategoryDances cd on cd.CategoryID = r.CategoryID
                    join core.Dances d on d.DanceID = cd.DanceID
                    where r.RoundID = @roundID
                    order by d.DanceID";

            var dances = (await conn.QueryAsync<dynamic>(dancesSql, new { roundID })).ToList();
            sheet.Dances = dances.Select(d => new QualifyingDance
            {
                DanceID = (long)d.DanceID,
                DanceName = (string)d.DanceName
            }).ToList();

                            var crossesSql = @"select tr.RegistrationID, tr.StartNumber,m.DanceID, count(*) as CrossCount
                        from events.Rounds r
                        join events.TournamentsRegistration tr
                               on  tr.TournamentID = r.TournamentID
                               and tr.CategoryID = r.CategoryID
                        left join judging.Marks m
                               on m.RoundID = r.RoundID
                              and m.RegistrationID = tr.RegistrationID
                              and m.IsCross = 1
                        where r.RoundID = @roundID
                        group by tr.RegistrationID, tr.StartNumber, m.DanceID
                        order by tr.StartNumber, m.DanceID";

            var crossRows = (await conn.QueryAsync<dynamic>(crossesSql, new { roundID })).ToList();

            var advancementSql = @"
                        select RegistrationID, CrossCount as TotalCrosses, Advanced
                        from judging.RoundAdvancements
                        where RoundID = @roundID";

            var advancements = (await conn.QueryAsync<dynamic>(advancementSql, new { roundID })).ToList();

            var coupleGroups = crossRows.GroupBy(c => (long)c.RegistrationID);

            foreach (var group in coupleGroups)
            {
                var firstRow = group.First();
                var registrationID = (long)firstRow.RegistrationID;
                var advancement = advancements.FirstOrDefault(a => (long)a.RegistrationID == registrationID);

                var couple = new QualifyingCoupleRow
                {
                    RegistrationID = registrationID,
                    StartNumber = (int)firstRow.StartNumber,
                    TotalCrosses = advancement is not null ? (int)advancement.TotalCrosses : 0,
                    Advanced = advancement is not null ? (bool)advancement.Advanced : false,
                    DanceCrosses = new List<DanceCrossInfo>()
                };

                foreach (var dance in sheet.Dances)
                {
                    var danceRow = group.FirstOrDefault(g => g.DanceID is not null && (long)g.DanceID == dance.DanceID);
                    couple.DanceCrosses.Add(new DanceCrossInfo
                    {
                        DanceID = dance.DanceID,
                        CrossCount = danceRow is not null ? (int)danceRow.CrossCount : 0
                    });
                }

                sheet.Couples.Add(couple);
            }

            sheet.Couples = sheet.Couples
                .OrderByDescending(c => c.TotalCrosses)
                .ThenBy(c => c.StartNumber)
                .ToList();

            return sheet;
        }
        public async Task<TournamentResultsView?> GetTournamentResultsAsync(long tournamentID)
        {
            using var conn = new SqlConnection(_connectionString);

                var headerSql = @"
                select TournamentID, TournamentName, TournamentDate, Location
                from events.Tournaments
                where TournamentID = @tournamentID";

            var header = await conn.QuerySingleOrDefaultAsync<TournamentResultsView>(headerSql, new { tournamentID });
            if (header is null) return null;

            var categoriesSql = @" select distinct r.CategoryID,c.AgeGroup
                 + case when c.Class is not null then ' ' + c.Class else '' end
                 + ' ' + c.DanceStyle as CategoryName
                    from events.Rounds r
                    join core.Categories c on c.CategoryID = r.CategoryID
                    where r.TournamentID = @tournamentID
                      and r.Status = 'CL'
                    order by CategoryName";

            var categories = (await conn.QueryAsync<CategoryResultGroup>(categoriesSql, new { tournamentID })).ToList();

            foreach (var category in categories)
            {
                
                var roundsSql = @"select RoundID, RoundType
                            from events.Rounds
                            where TournamentID = @tournamentID
                                 and CategoryID = @categoryID
                                and Status = 'CL'
                            order by RoundNumber";

                category.Rounds = (await conn.QueryAsync<RoundLink>(roundsSql, new
                {
                    tournamentID,
                    categoryID = category.CategoryID
                })).ToList();

                var finalRound = category.Rounds.FirstOrDefault(r => r.RoundType == "FN");
                if (finalRound is not null)
                {
                    category.FinalRoundID = finalRound.RoundID;

                    var placementsSql = @"
                            select res.FinalPlace, tr.StartNumber,tr.RegPartner1Name + ' / ' + tr.RegPartner2Name as CoupleName,
                            tr.RegClubName as ClubName
                            from judging.Results res
                                join events.TournamentsRegistration tr on tr.RegistrationID = res.RegistrationID
                            where res.RoundID = @finalRoundID
                            order by res.FinalPlace";

                    category.Placements = (await conn.QueryAsync<FinalPlacement>(placementsSql, new
                    {
                        finalRoundID = finalRound.RoundID
                    })).ToList();
                }
            }

            header.Categories = categories.Where(c => c.Placements.Any() || c.Rounds.Any()).ToList();

            return header;
        }
        public async Task<(bool success, string? error, int roundsAffected)> AssignHeatsAsync(long tournamentID)
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var checkSql = "select count(*) from events.Tournaments where TournamentID = @tournamentID";
            var exists = await conn.ExecuteScalarAsync<int>(checkSql, new { tournamentID });

            if (exists == 0)
                return (false, "Турнирът не съществува", 0);

            var countSql = @"
                select count(*) from events.Rounds
                where TournamentID = @tournamentID
                    and RoundType = 'QL'
                    and Status = 'PN'";

            var roundsToProcess = await conn.ExecuteScalarAsync<int>(countSql, new { tournamentID });

            if (roundsToProcess == 0)
                return (false, "Няма квалификационни кръгове в статус 'Чакащ' за разпределяне", 0);

            try
            {
                await conn.ExecuteAsync(
                    "events.sp_assign_heats",
                    new { p_TournamentID = tournamentID },
                    commandType: System.Data.CommandType.StoredProcedure
                );
                return (true, null, roundsToProcess);
            }
            catch (Exception ex)
            {
                return (false, $"Грешка при разпределяне на серии: {ex.Message}", 0);
            }
        }
    }
}
