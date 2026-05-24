-- validates sp_calculate_skating against the official outcome of
-- the british professional latin championship 2024 (blackpool dance festival).
-- source: https://www.scrutineerportal.com/results.php?competition_id=11214
--
-- 11 adjudicators (A-K), 6 finalist couples, 5 latin dances.
-- couple 96 was a 7th couple in jive only (redance) and is not in the
-- overall final - excluded from this dataset so the comparison stays clean.
--
-- if sp_calculate_skating produces the same placements as the official
-- result, the implementation matches real-world scrutineering software.

use DancesportCMS;
go


-- cleanup
declare @oldT bigint = (select TournamentID from events.Tournaments where TournamentName = 'Blackpool 2024 - Pro Latin');
if @oldT is not null
begin
    declare @oldR table (RoundID bigint);
    insert @oldR select RoundID from events.Rounds where TournamentID = @oldT;

    delete from judging.Marks where RoundID in (select RoundID from @oldR);
    delete from judging.JudgePanelAssignments where RoundID in (select RoundID from @oldR);
    delete from judging.DancePlacements where RoundID in (select RoundID from @oldR);
    delete from judging.Results where RoundID in (select RoundID from @oldR);
    delete from events.Rounds where TournamentID = @oldT
    delete from events.TournamentsRegistration where TournamentID = @oldT
    delete from events.Tournaments where TournamentID = @oldT
end
go


--  create 11 adjudicators (A through K) if they don't already exist 
declare @letters table (l char(1), email nvarchar(50));
insert @letters values
    ('A','bp_adj_a@test.bg'), ('B','bp_adj_b@test.bg'), ('C','bp_adj_c@test.bg'),
    ('D','bp_adj_d@test.bg'), ('E','bp_adj_e@test.bg'), ('F','bp_adj_f@test.bg'),
    ('G','bp_adj_g@test.bg'), ('H','bp_adj_h@test.bg'), ('I','bp_adj_i@test.bg'),
    ('J','bp_adj_j@test.bg'), ('K','bp_adj_k@test.bg');

insert into core.Users (Email, Salt, Password, FName, LName, JudgeLicense, IsAdmin, IsJudge, IsUser)
select l.email, 'salt', 'pass', 'Adjudicator', l.l, 'BP-' + l.l, 0, 1, 1
from @letters l
where not exists (select 1 from core.Users u where u.Email = l.email);
go


--  create tournament 
insert into events.Tournaments (TournamentName, TournamentDate, Location, IsRegistrationOpen, IsFinished)
values ('Blackpool 2024 - Pro Latin', '2024-05-24', 'Blackpool, England', 0, 1);

declare @tid bigint = scope_identity();
declare @cid bigint = (select top 1 CategoryID from core.Categories where AgeGroup = 'Adult' and DanceStyle = 'LA' and Class is null);

if @cid is null
begin
    raiserror('Adult LA category not found - check seed data', 16, 1);
    return;
end


--  register 6 finalists 
insert into events.TournamentsRegistration
    (TournamentID, CategoryID, FederationID, StartNumber, RegPartner1Name, RegPartner2Name, RegClubName, HadPaidFee, IsCheckedIn, IsDisqualified)
values
    (@tid, @cid, null,  10, 'Dorin Frecautanu',  'Marina Sergeeva',     'England',      1, 1, 0),
    (@tid, @cid, null,  32, 'Klemen Prasnikar',  'Alexandra Averkieva', 'Slovenia',     1, 1, 0),
    (@tid, @cid, null,  52, 'Darren Hammond',    'Marina Steshenko',    'South Africa', 1, 1, 0),
    (@tid, @cid, null,  78, 'Tal Livshitz',      'Ilana Keselman',      'Israel',       1, 1, 0),
    (@tid, @cid, null, 115, 'Andrei Kazlouski',  'Nino Dzneladze',      'Belarus',      1, 1, 0),
    (@tid, @cid, null, 137, 'Kirill Belorukov',  'Valeria Aidaeva',     'Russia',       1, 1, 0);


--  create final round 
insert into events.Rounds (TournamentID, CategoryID, RoundType, RoundNumber, Status)
values (@tid, @cid, 'FN', 1, 'CL');
declare @rid bigint = scope_identity();


--  assign all 11 judges to the panel 
insert into judging.JudgePanelAssignments (RoundID, UserID)
select @rid, u.UserID
from core.Users u
where u.Email like 'bp_adj_%@test.bg';


--  helper variables: registration ids and judge user ids 
declare @c10 bigint = (select RegistrationID from events.TournamentsRegistration where TournamentID = @tid and StartNumber = 10);
declare @c32 bigint = (select RegistrationID from events.TournamentsRegistration where TournamentID = @tid and StartNumber = 32);
declare @c52 bigint = (select RegistrationID from events.TournamentsRegistration where TournamentID = @tid and StartNumber = 52);
declare @c78 bigint = (select RegistrationID from events.TournamentsRegistration where TournamentID = @tid and StartNumber = 78);
declare @c115 bigint = (select RegistrationID from events.TournamentsRegistration where TournamentID = @tid and StartNumber = 115);
declare @c137 bigint = (select RegistrationID from events.TournamentsRegistration where TournamentID = @tid and StartNumber = 137);

declare @ja bigint = (select UserID from core.Users where Email = 'bp_adj_a@test.bg');
declare @jb bigint = (select UserID from core.Users where Email = 'bp_adj_b@test.bg');
declare @jc bigint = (select UserID from core.Users where Email = 'bp_adj_c@test.bg');
declare @jd bigint = (select UserID from core.Users where Email = 'bp_adj_d@test.bg');
declare @je bigint = (select UserID from core.Users where Email = 'bp_adj_e@test.bg');
declare @jf bigint = (select UserID from core.Users where Email = 'bp_adj_f@test.bg');
declare @jg bigint = (select UserID from core.Users where Email = 'bp_adj_g@test.bg');
declare @jh bigint = (select UserID from core.Users where Email = 'bp_adj_h@test.bg');
declare @ji bigint = (select UserID from core.Users where Email = 'bp_adj_i@test.bg');
declare @jj bigint = (select UserID from core.Users where Email = 'bp_adj_j@test.bg');
declare @jk bigint = (select UserID from core.Users where Email = 'bp_adj_k@test.bg');

declare @dCha bigint = (select DanceID from core.Dances where Name = 'Cha-Cha');
declare @dSam bigint = (select DanceID from core.Dances where Name = 'Samba');
declare @dRum bigint = (select DanceID from core.Dances where Name = 'Rumba');
declare @dPas bigint = (select DanceID from core.Dances where Name = 'Paso Doble');
declare @dJiv bigint = (select DanceID from core.Dances where Name = 'Jive');


--  cha cha marks 
insert into judging.Marks (RegistrationID, UserID, DanceID, RoundID, IsCross, MarkValue)
values
    -- couple 10 (winner)
    (@c10, @ja, @dCha, @rid, 0, 1), (@c10, @jb, @dCha, @rid, 0, 1), (@c10, @jc, @dCha, @rid, 0, 1),
    (@c10, @jd, @dCha, @rid, 0, 1), (@c10, @je, @dCha, @rid, 0, 1), (@c10, @jf, @dCha, @rid, 0, 1),
    (@c10, @jg, @dCha, @rid, 0, 1), (@c10, @jh, @dCha, @rid, 0, 1), (@c10, @ji, @dCha, @rid, 0, 1),
    (@c10, @jj, @dCha, @rid, 0, 2), (@c10, @jk, @dCha, @rid, 0, 1),
    -- couple 32
    (@c32, @ja, @dCha, @rid, 0, 3), (@c32, @jb, @dCha, @rid, 0, 4), (@c32, @jc, @dCha, @rid, 0, 4),
    (@c32, @jd, @dCha, @rid, 0, 5), (@c32, @je, @dCha, @rid, 0, 3), (@c32, @jf, @dCha, @rid, 0, 3),
    (@c32, @jg, @dCha, @rid, 0, 3), (@c32, @jh, @dCha, @rid, 0, 3), (@c32, @ji, @dCha, @rid, 0, 3),
    (@c32, @jj, @dCha, @rid, 0, 4), (@c32, @jk, @dCha, @rid, 0, 3),
    -- couple 52
    (@c52, @ja, @dCha, @rid, 0, 6), (@c52, @jb, @dCha, @rid, 0, 5), (@c52, @jc, @dCha, @rid, 0, 5),
    (@c52, @jd, @dCha, @rid, 0, 3), (@c52, @je, @dCha, @rid, 0, 5), (@c52, @jf, @dCha, @rid, 0, 5),
    (@c52, @jg, @dCha, @rid, 0, 6), (@c52, @jh, @dCha, @rid, 0, 6), (@c52, @ji, @dCha, @rid, 0, 6),
    (@c52, @jj, @dCha, @rid, 0, 3), (@c52, @jk, @dCha, @rid, 0, 4),
    -- couple 78
    (@c78, @ja, @dCha, @rid, 0, 5), (@c78, @jb, @dCha, @rid, 0, 6), (@c78, @jc, @dCha, @rid, 0, 6),
    (@c78, @jd, @dCha, @rid, 0, 6), (@c78, @je, @dCha, @rid, 0, 6), (@c78, @jf, @dCha, @rid, 0, 6),
    (@c78, @jg, @dCha, @rid, 0, 5), (@c78, @jh, @dCha, @rid, 0, 5), (@c78, @ji, @dCha, @rid, 0, 5),
    (@c78, @jj, @dCha, @rid, 0, 6), (@c78, @jk, @dCha, @rid, 0, 6),
    -- couple 115
    (@c115, @ja, @dCha, @rid, 0, 4), (@c115, @jb, @dCha, @rid, 0, 3), (@c115, @jc, @dCha, @rid, 0, 3),
    (@c115, @jd, @dCha, @rid, 0, 4), (@c115, @je, @dCha, @rid, 0, 4), (@c115, @jf, @dCha, @rid, 0, 4),
    (@c115, @jg, @dCha, @rid, 0, 4), (@c115, @jh, @dCha, @rid, 0, 4), (@c115, @ji, @dCha, @rid, 0, 4),
    (@c115, @jj, @dCha, @rid, 0, 5), (@c115, @jk, @dCha, @rid, 0, 5),
    -- couple 137
    (@c137, @ja, @dCha, @rid, 0, 2), (@c137, @jb, @dCha, @rid, 0, 2), (@c137, @jc, @dCha, @rid, 0, 2),
    (@c137, @jd, @dCha, @rid, 0, 2), (@c137, @je, @dCha, @rid, 0, 2), (@c137, @jf, @dCha, @rid, 0, 2),
    (@c137, @jg, @dCha, @rid, 0, 2), (@c137, @jh, @dCha, @rid, 0, 2), (@c137, @ji, @dCha, @rid, 0, 2),
    (@c137, @jj, @dCha, @rid, 0, 1), (@c137, @jk, @dCha, @rid, 0, 2);


--  samba marks 
insert into judging.Marks (RegistrationID, UserID, DanceID, RoundID, IsCross, MarkValue)
values
    (@c10, @ja, @dSam, @rid, 0, 1), (@c10, @jb, @dSam, @rid, 0, 1), (@c10, @jc, @dSam, @rid, 0, 1),
    (@c10, @jd, @dSam, @rid, 0, 1), (@c10, @je, @dSam, @rid, 0, 1), (@c10, @jf, @dSam, @rid, 0, 1),
    (@c10, @jg, @dSam, @rid, 0, 1), (@c10, @jh, @dSam, @rid, 0, 1), (@c10, @ji, @dSam, @rid, 0, 1),
    (@c10, @jj, @dSam, @rid, 0, 3), (@c10, @jk, @dSam, @rid, 0, 1),

    (@c32, @ja, @dSam, @rid, 0, 3), (@c32, @jb, @dSam, @rid, 0, 4), (@c32, @jc, @dSam, @rid, 0, 3),
    (@c32, @jd, @dSam, @rid, 0, 5), (@c32, @je, @dSam, @rid, 0, 3), (@c32, @jf, @dSam, @rid, 0, 3),
    (@c32, @jg, @dSam, @rid, 0, 2), (@c32, @jh, @dSam, @rid, 0, 3), (@c32, @ji, @dSam, @rid, 0, 3),
    (@c32, @jj, @dSam, @rid, 0, 2), (@c32, @jk, @dSam, @rid, 0, 3),

    (@c52, @ja, @dSam, @rid, 0, 5), (@c52, @jb, @dSam, @rid, 0, 5), (@c52, @jc, @dSam, @rid, 0, 5),
    (@c52, @jd, @dSam, @rid, 0, 4), (@c52, @je, @dSam, @rid, 0, 5), (@c52, @jf, @dSam, @rid, 0, 5),
    (@c52, @jg, @dSam, @rid, 0, 5), (@c52, @jh, @dSam, @rid, 0, 6), (@c52, @ji, @dSam, @rid, 0, 5),
    (@c52, @jj, @dSam, @rid, 0, 4), (@c52, @jk, @dSam, @rid, 0, 5),

    (@c78, @ja, @dSam, @rid, 0, 6), (@c78, @jb, @dSam, @rid, 0, 6), (@c78, @jc, @dSam, @rid, 0, 6),
    (@c78, @jd, @dSam, @rid, 0, 6), (@c78, @je, @dSam, @rid, 0, 6), (@c78, @jf, @dSam, @rid, 0, 6),
    (@c78, @jg, @dSam, @rid, 0, 6), (@c78, @jh, @dSam, @rid, 0, 5), (@c78, @ji, @dSam, @rid, 0, 6),
    (@c78, @jj, @dSam, @rid, 0, 6), (@c78, @jk, @dSam, @rid, 0, 6),

    (@c115, @ja, @dSam, @rid, 0, 4), (@c115, @jb, @dSam, @rid, 0, 3), (@c115, @jc, @dSam, @rid, 0, 4),
    (@c115, @jd, @dSam, @rid, 0, 3), (@c115, @je, @dSam, @rid, 0, 4), (@c115, @jf, @dSam, @rid, 0, 4),
    (@c115, @jg, @dSam, @rid, 0, 4), (@c115, @jh, @dSam, @rid, 0, 4), (@c115, @ji, @dSam, @rid, 0, 4),
    (@c115, @jj, @dSam, @rid, 0, 5), (@c115, @jk, @dSam, @rid, 0, 4),

    (@c137, @ja, @dSam, @rid, 0, 2), (@c137, @jb, @dSam, @rid, 0, 2), (@c137, @jc, @dSam, @rid, 0, 2),
    (@c137, @jd, @dSam, @rid, 0, 2), (@c137, @je, @dSam, @rid, 0, 2), (@c137, @jf, @dSam, @rid, 0, 2),
    (@c137, @jg, @dSam, @rid, 0, 3), (@c137, @jh, @dSam, @rid, 0, 2), (@c137, @ji, @dSam, @rid, 0, 2),
    (@c137, @jj, @dSam, @rid, 0, 1), (@c137, @jk, @dSam, @rid, 0, 2);


--  rumba marks
insert into judging.Marks (RegistrationID, UserID, DanceID, RoundID, IsCross, MarkValue)
values
    (@c10, @ja, @dRum, @rid, 0, 1), (@c10, @jb, @dRum, @rid, 0, 1), (@c10, @jc, @dRum, @rid, 0, 1),
    (@c10, @jd, @dRum, @rid, 0, 1), (@c10, @je, @dRum, @rid, 0, 1), (@c10, @jf, @dRum, @rid, 0, 1),
    (@c10, @jg, @dRum, @rid, 0, 1), (@c10, @jh, @dRum, @rid, 0, 1), (@c10, @ji, @dRum, @rid, 0, 2),
    (@c10, @jj, @dRum, @rid, 0, 2), (@c10, @jk, @dRum, @rid, 0, 1),

    (@c32, @ja, @dRum, @rid, 0, 3), (@c32, @jb, @dRum, @rid, 0, 4), (@c32, @jc, @dRum, @rid, 0, 4),
    (@c32, @jd, @dRum, @rid, 0, 5), (@c32, @je, @dRum, @rid, 0, 3), (@c32, @jf, @dRum, @rid, 0, 3),
    (@c32, @jg, @dRum, @rid, 0, 3), (@c32, @jh, @dRum, @rid, 0, 3), (@c32, @ji, @dRum, @rid, 0, 3),
    (@c32, @jj, @dRum, @rid, 0, 3), (@c32, @jk, @dRum, @rid, 0, 3),

    (@c52, @ja, @dRum, @rid, 0, 6), (@c52, @jb, @dRum, @rid, 0, 5), (@c52, @jc, @dRum, @rid, 0, 5),
    (@c52, @jd, @dRum, @rid, 0, 4), (@c52, @je, @dRum, @rid, 0, 4), (@c52, @jf, @dRum, @rid, 0, 5),
    (@c52, @jg, @dRum, @rid, 0, 4), (@c52, @jh, @dRum, @rid, 0, 6), (@c52, @ji, @dRum, @rid, 0, 6),
    (@c52, @jj, @dRum, @rid, 0, 4), (@c52, @jk, @dRum, @rid, 0, 4),

    (@c78, @ja, @dRum, @rid, 0, 4), (@c78, @jb, @dRum, @rid, 0, 6), (@c78, @jc, @dRum, @rid, 0, 6),
    (@c78, @jd, @dRum, @rid, 0, 6), (@c78, @je, @dRum, @rid, 0, 6), (@c78, @jf, @dRum, @rid, 0, 6),
    (@c78, @jg, @dRum, @rid, 0, 5), (@c78, @jh, @dRum, @rid, 0, 5), (@c78, @ji, @dRum, @rid, 0, 5),
    (@c78, @jj, @dRum, @rid, 0, 6), (@c78, @jk, @dRum, @rid, 0, 6),

    (@c115, @ja, @dRum, @rid, 0, 5), (@c115, @jb, @dRum, @rid, 0, 2), (@c115, @jc, @dRum, @rid, 0, 3),
    (@c115, @jd, @dRum, @rid, 0, 3), (@c115, @je, @dRum, @rid, 0, 5), (@c115, @jf, @dRum, @rid, 0, 4),
    (@c115, @jg, @dRum, @rid, 0, 6), (@c115, @jh, @dRum, @rid, 0, 4), (@c115, @ji, @dRum, @rid, 0, 4),
    (@c115, @jj, @dRum, @rid, 0, 5), (@c115, @jk, @dRum, @rid, 0, 5),

    (@c137, @ja, @dRum, @rid, 0, 2), (@c137, @jb, @dRum, @rid, 0, 3), (@c137, @jc, @dRum, @rid, 0, 2),
    (@c137, @jd, @dRum, @rid, 0, 2), (@c137, @je, @dRum, @rid, 0, 2), (@c137, @jf, @dRum, @rid, 0, 2),
    (@c137, @jg, @dRum, @rid, 0, 2), (@c137, @jh, @dRum, @rid, 0, 2), (@c137, @ji, @dRum, @rid, 0, 1),
    (@c137, @jj, @dRum, @rid, 0, 1), (@c137, @jk, @dRum, @rid, 0, 2);


-- ===== paso doble marks =====
insert into judging.Marks (RegistrationID, UserID, DanceID, RoundID, IsCross, MarkValue)
values
    (@c10, @ja, @dPas, @rid, 0, 1), (@c10, @jb, @dPas, @rid, 0, 1), (@c10, @jc, @dPas, @rid, 0, 1),
    (@c10, @jd, @dPas, @rid, 0, 2), (@c10, @je, @dPas, @rid, 0, 1), (@c10, @jf, @dPas, @rid, 0, 1),
    (@c10, @jg, @dPas, @rid, 0, 1), (@c10, @jh, @dPas, @rid, 0, 1), (@c10, @ji, @dPas, @rid, 0, 2),
    (@c10, @jj, @dPas, @rid, 0, 3), (@c10, @jk, @dPas, @rid, 0, 1),

    (@c32, @ja, @dPas, @rid, 0, 3), (@c32, @jb, @dPas, @rid, 0, 4), (@c32, @jc, @dPas, @rid, 0, 3),
    (@c32, @jd, @dPas, @rid, 0, 5), (@c32, @je, @dPas, @rid, 0, 3), (@c32, @jf, @dPas, @rid, 0, 3),
    (@c32, @jg, @dPas, @rid, 0, 3), (@c32, @jh, @dPas, @rid, 0, 3), (@c32, @ji, @dPas, @rid, 0, 3),
    (@c32, @jj, @dPas, @rid, 0, 2), (@c32, @jk, @dPas, @rid, 0, 3),

    (@c52, @ja, @dPas, @rid, 0, 6), (@c52, @jb, @dPas, @rid, 0, 5), (@c52, @jc, @dPas, @rid, 0, 5),
    (@c52, @jd, @dPas, @rid, 0, 4), (@c52, @je, @dPas, @rid, 0, 4), (@c52, @jf, @dPas, @rid, 0, 5),
    (@c52, @jg, @dPas, @rid, 0, 5), (@c52, @jh, @dPas, @rid, 0, 6), (@c52, @ji, @dPas, @rid, 0, 5),
    (@c52, @jj, @dPas, @rid, 0, 4), (@c52, @jk, @dPas, @rid, 0, 4),

    (@c78, @ja, @dPas, @rid, 0, 5), (@c78, @jb, @dPas, @rid, 0, 6), (@c78, @jc, @dPas, @rid, 0, 6),
    (@c78, @jd, @dPas, @rid, 0, 6), (@c78, @je, @dPas, @rid, 0, 6), (@c78, @jf, @dPas, @rid, 0, 6),
    (@c78, @jg, @dPas, @rid, 0, 6), (@c78, @jh, @dPas, @rid, 0, 5), (@c78, @ji, @dPas, @rid, 0, 6),
    (@c78, @jj, @dPas, @rid, 0, 6), (@c78, @jk, @dPas, @rid, 0, 6),

    (@c115, @ja, @dPas, @rid, 0, 4), (@c115, @jb, @dPas, @rid, 0, 2), (@c115, @jc, @dPas, @rid, 0, 4),
    (@c115, @jd, @dPas, @rid, 0, 3), (@c115, @je, @dPas, @rid, 0, 5), (@c115, @jf, @dPas, @rid, 0, 4),
    (@c115, @jg, @dPas, @rid, 0, 4), (@c115, @jh, @dPas, @rid, 0, 4), (@c115, @ji, @dPas, @rid, 0, 4),
    (@c115, @jj, @dPas, @rid, 0, 5), (@c115, @jk, @dPas, @rid, 0, 5),

    (@c137, @ja, @dPas, @rid, 0, 2), (@c137, @jb, @dPas, @rid, 0, 3), (@c137, @jc, @dPas, @rid, 0, 2),
    (@c137, @jd, @dPas, @rid, 0, 1), (@c137, @je, @dPas, @rid, 0, 2), (@c137, @jf, @dPas, @rid, 0, 2),
    (@c137, @jg, @dPas, @rid, 0, 2), (@c137, @jh, @dPas, @rid, 0, 2), (@c137, @ji, @dPas, @rid, 0, 1),
    (@c137, @jj, @dPas, @rid, 0, 1), (@c137, @jk, @dPas, @rid, 0, 2);


--  jive marks 
-- couple 96 (7th place in original) is excluded - they were not in the overall final.
-- some marks here reach value 7 because the original field was 7 couples.
insert into judging.Marks (RegistrationID, UserID, DanceID, RoundID, IsCross, MarkValue)
values
    (@c10, @ja, @dJiv, @rid, 0, 1), (@c10, @jb, @dJiv, @rid, 0, 1), (@c10, @jc, @dJiv, @rid, 0, 1),
    (@c10, @jd, @dJiv, @rid, 0, 1), (@c10, @je, @dJiv, @rid, 0, 1), (@c10, @jf, @dJiv, @rid, 0, 1),
    (@c10, @jg, @dJiv, @rid, 0, 1), (@c10, @jh, @dJiv, @rid, 0, 1), (@c10, @ji, @dJiv, @rid, 0, 1),
    (@c10, @jj, @dJiv, @rid, 0, 3), (@c10, @jk, @dJiv, @rid, 0, 1),

    (@c32, @ja, @dJiv, @rid, 0, 3), (@c32, @jb, @dJiv, @rid, 0, 4), (@c32, @jc, @dJiv, @rid, 0, 3),
    (@c32, @jd, @dJiv, @rid, 0, 6), (@c32, @je, @dJiv, @rid, 0, 3), (@c32, @jf, @dJiv, @rid, 0, 3),
    (@c32, @jg, @dJiv, @rid, 0, 2), (@c32, @jh, @dJiv, @rid, 0, 3), (@c32, @ji, @dJiv, @rid, 0, 3),
    (@c32, @jj, @dJiv, @rid, 0, 2), (@c32, @jk, @dJiv, @rid, 0, 3),

    (@c52, @ja, @dJiv, @rid, 0, 6), (@c52, @jb, @dJiv, @rid, 0, 6), (@c52, @jc, @dJiv, @rid, 0, 5),
    (@c52, @jd, @dJiv, @rid, 0, 3), (@c52, @je, @dJiv, @rid, 0, 5), (@c52, @jf, @dJiv, @rid, 0, 6),
    (@c52, @jg, @dJiv, @rid, 0, 4), (@c52, @jh, @dJiv, @rid, 0, 7), (@c52, @ji, @dJiv, @rid, 0, 7),
    (@c52, @jj, @dJiv, @rid, 0, 4), (@c52, @jk, @dJiv, @rid, 0, 4),

    (@c78, @ja, @dJiv, @rid, 0, 5), (@c78, @jb, @dJiv, @rid, 0, 7), (@c78, @jc, @dJiv, @rid, 0, 6),
    (@c78, @jd, @dJiv, @rid, 0, 7), (@c78, @je, @dJiv, @rid, 0, 6), (@c78, @jf, @dJiv, @rid, 0, 7),
    (@c78, @jg, @dJiv, @rid, 0, 5), (@c78, @jh, @dJiv, @rid, 0, 6), (@c78, @ji, @dJiv, @rid, 0, 5),
    (@c78, @jj, @dJiv, @rid, 0, 7), (@c78, @jk, @dJiv, @rid, 0, 6),

    (@c115, @ja, @dJiv, @rid, 0, 4), (@c115, @jb, @dJiv, @rid, 0, 3), (@c115, @jc, @dJiv, @rid, 0, 4),
    (@c115, @jd, @dJiv, @rid, 0, 5), (@c115, @je, @dJiv, @rid, 0, 4), (@c115, @jf, @dJiv, @rid, 0, 5),
    (@c115, @jg, @dJiv, @rid, 0, 6), (@c115, @jh, @dJiv, @rid, 0, 4), (@c115, @ji, @dJiv, @rid, 0, 4),
    (@c115, @jj, @dJiv, @rid, 0, 5), (@c115, @jk, @dJiv, @rid, 0, 5),

    (@c137, @ja, @dJiv, @rid, 0, 2), (@c137, @jb, @dJiv, @rid, 0, 2), (@c137, @jc, @dJiv, @rid, 0, 2),
    (@c137, @jd, @dJiv, @rid, 0, 2), (@c137, @je, @dJiv, @rid, 0, 2), (@c137, @jf, @dJiv, @rid, 0, 2),
    (@c137, @jg, @dJiv, @rid, 0, 3), (@c137, @jh, @dJiv, @rid, 0, 2), (@c137, @ji, @dJiv, @rid, 0, 2),
    (@c137, @jj, @dJiv, @rid, 0, 1), (@c137, @jk, @dJiv, @rid, 0, 2);


exec judging.sp_calculate_skating @rid;


--  official outcome 
print '';
print '=== per-dance placements ===';
select
    d.Name as Dance,
    tr.StartNumber as Couple,
    cast(dp.DancePlacement as varchar(10)) as Place,
    tr.RegPartner1Name + ' / ' + tr.RegPartner2Name as Couple_Name
from judging.DancePlacements dp
join events.TournamentsRegistration tr on tr.RegistrationID = dp.RegistrationID
join core.Dances d on d.DanceID = dp.DanceID
where dp.RoundID = @rid
order by d.Name, dp.DancePlacement;

print '';
print '=== overall final - your system vs official Blackpool 2024 ===';
select
    r.FinalPlace as MyResult,
    tr.StartNumber as Couple,
    tr.RegPartner1Name + ' / ' + tr.RegPartner2Name as Couple_Name,
    case tr.StartNumber
        when 10  then 1
        when 137 then 2
        when 32  then 3
        when 115 then 4
        when 52  then 5
        when 78  then 6
    end as Official,
    case
        when r.FinalPlace = case tr.StartNumber
            when 10  then 1 when 137 then 2 when 32 then 3
            when 115 then 4 when 52  then 5 when 78 then 6
        end then 'MATCH' else 'MISMATCH'
    end as Status
from judging.Results r
join events.TournamentsRegistration tr on tr.RegistrationID = r.RegistrationID
where r.RoundID = @rid
order by r.FinalPlace;
go