using DancesportCMS_api.Models;
using Dapper;
using Microsoft.Data.Sql;
using Microsoft.Data.SqlClient;


namespace DancesportCMS_api.Repositories
{
    public class BiasRepository
    {
        private readonly string _connectionString;

        public BiasRepository(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DancesportDB")!;
        }

        public async Task<BiasOverview> GetJudgeClubMatrixAsync()
        {
            using var conn = new SqlConnection(_connectionString);

            var sql = @"
                    with mark_panel_stats as (
                        select
                            m.UserID,
                            m.RegistrationID,
                            m.DanceID,
                            m.RoundID,
                            m.MarkValue,
                            tr.RegClubName as ClubName,
                            percentile_cont(0.5) within group (order by m.MarkValue) over (
                                partition by m.RoundID, m.DanceID, m.RegistrationID
                            ) as PanelMedian,
                            stdev(cast(m.MarkValue as float)) over (
                                partition by m.RoundID, m.DanceID, m.RegistrationID
                            ) as PanelStdDev
                        from   judging.Marks m
                        join   events.TournamentsRegistration tr on tr.RegistrationID = m.RegistrationID
                        where  m.MarkValue is not null
                    ),
                    deviations as (
                        select
                            UserID,
                            ClubName,
                            MarkValue,
                            PanelMedian,
                            PanelStdDev,
                            (MarkValue - PanelMedian) as RawDeviation,
                            case
                                when PanelStdDev > 0 then (MarkValue - PanelMedian) / PanelStdDev
                                else 0
                            end as ZScore
                        from mark_panel_stats
                    ),
                    significant_deviations as (
                        select
                            UserID,
                            ClubName,
                            ZScore,
                            RawDeviation,
                            case
                                when abs(RawDeviation) >= 2 and abs(ZScore) > 1.5 then 1
                                else 0
                            end as IsSignificant
                        from deviations
                    ),
                    judge_club_summary as (
                        select
                            UserID,
                            ClubName,
                            count(*) as MarkCount,
                            avg(ZScore) as AvgZScore,
                            avg(cast(RawDeviation as float)) as AvgRawDeviation,
                            sum(IsSignificant) as SignificantCount,
                            cast(floor(count(*) / 2.0) + 1 as int) as BiasThreshold
                        from significant_deviations
                        group by UserID, ClubName
                    )
                    select
                        u.UserID,
                        u.FName + ' ' + u.LName as JudgeName,
                        s.ClubName,
                        s.MarkCount,
                        s.BiasThreshold,
                        round(s.AvgZScore, 3) as AvgZScore,
                        round(s.AvgRawDeviation, 2) as AvgRawDeviation,
                        s.SignificantCount,
                        case
                            when s.SignificantCount >= s.BiasThreshold and s.AvgZScore < 0 then 'FAVOR'
                            when s.SignificantCount >= s.BiasThreshold and s.AvgZScore > 0 then 'PENALTY'
                            else 'NEUTRAL'
                        end as BiasDirection,
                        case
                            when s.SignificantCount >= s.BiasThreshold and abs(s.AvgZScore) >= 1.0 then 'HIGH'
                            when s.SignificantCount >= s.BiasThreshold and abs(s.AvgZScore) >= 0.7 then 'MODERATE'
                            when s.SignificantCount >= s.BiasThreshold - 1 and abs(s.AvgZScore) >= 0.5 then 'LOW'
                            else 'NONE'
                        end as Severity,
                        case
                            when s.MarkCount >= 15 then 'HIGH'
                            when s.MarkCount >= 8 then 'MEDIUM'
                            else 'LOW'
                        end as Confidence
                    from   judge_club_summary s
                    join   core.Users u on u.UserID = s.UserID
                    where  s.MarkCount >= 3
                    order  by
                        case
                            when s.SignificantCount >= s.BiasThreshold and abs(s.AvgZScore) >= 1.0 then 1
                            when s.SignificantCount >= s.BiasThreshold and abs(s.AvgZScore) >= 0.7 then 2
                            else 3
                        end,
                        s.SignificantCount desc";

            var rows = (await conn.QueryAsync<JudgeClubBiasRow>(sql)).ToList();

            var overview = new BiasOverview
            {
                Rows = rows,
                TotalMarksAnalyzed = rows.Sum(r => r.MarkCount),
                JudgesAnalyzed = rows.Select(r => r.UserID).Distinct().Count(),
                ClubsAnalyzed = rows.Select(r => r.ClubName).Distinct().Count(),
                HighBiasSignals = rows.Count(r => r.Severity == "HIGH"),
                ModerateBiasSignals = rows.Count(r => r.Severity == "MODERATE"),
            };

            return overview;
        }
    }
}

