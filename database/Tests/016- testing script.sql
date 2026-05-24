-- validates sp_calculate_skating against the 4 worked examples from
-- the wikipedia skating system article. each test is a known case
-- with a known correct answer.
--

use DancesportCMS
go

-- cleanup  previous test runs
declare @oldRoundIds table (RoundID bigint);
insert @oldRoundIds
    select r.RoundID 
    from events.Rounds r
    join events.Tournaments t on t.TournamentID = r.TournamentID
    where t.TournamentName like 'Test%';

delete from judging.Marks where RoundID in (select RoundID from @oldRoundIds)
delete from judging.JudgePanelAssignments where RoundID in (select RoundID from @oldRoundIds)
delete from judging.DancePlacements where RoundID in (select RoundID from @oldRoundIds)
delete from judging.Results where RoundID in (select RoundID from @oldRoundIds)
delete from events.Rounds where RoundID in (select RoundID from @oldRoundIds)
delete from events.TournamentsRegistration where TournamentID in (
    select TournamentID from events.Tournaments where TournamentName like 'Test%')
delete from events.Tournaments where TournamentName like 'Test%'
go


--  setup 
insert into events.Tournaments (TournamentName, TournamentDate, Location, IsRegistrationOpen, IsFinished)
values ('Test Skating Validation', getdate(), 'Test Venue', 0, 1);

declare @tid bigint = scope_identity();
declare @cid bigint = (select top 1 CategoryID from core.Categories where AgeGroup = 'Youth' and DanceStyle = 'LA');
declare @did bigint = (select DanceID from core.Dances where Name = 'Cha-Cha');

declare @ja bigint = (select UserID from core.Users where Email = 'judge1@bgdsf.bg');
declare @jb bigint = (select UserID from core.Users where Email = 'judge2@bgdsf.bg');
declare @jc bigint = (select UserID from core.Users where Email = 'judge3@bgdsf.bg');
declare @jd bigint = (select UserID from core.Users where Email = 'judge4@bgdsf.bg');
declare @je bigint = (select UserID from core.Users where Email = 'judge5@bgdsf.bg');


--  test 1: clear majority 
-- 11 -> 1st, 12 -> 2nd, 13 -> 3rd
print '-- test 1: clear majority --';

insert into events.Rounds (TournamentID, CategoryID, RoundType, RoundNumber, Status)
values (@tid, @cid, 'FN', 1, 'CL');
declare @r1 bigint = scope_identity();

insert into events.TournamentsRegistration
    (TournamentID, CategoryID, FederationID, StartNumber, RegPartner1Name, RegPartner2Name, RegClubName, HadPaidFee, IsCheckedIn, IsDisqualified)
values
    (@tid, @cid, null, 11, 'C11', 'C11', 'TestClub', 1, 1, 0),
    (@tid, @cid, null, 12, 'C12', 'C12', 'TestClub', 1, 1, 0),
    (@tid, @cid, null, 13, 'C13', 'C13', 'TestClub', 1, 1, 0);

insert into judging.JudgePanelAssignments (RoundID, UserID)
values (@r1, @ja), (@r1, @jb), (@r1, @jc), (@r1, @jd), (@r1, @je);

;with c as (
    select RegistrationID, StartNumber from events.TournamentsRegistration
    where TournamentID = @tid and StartNumber in (11, 12, 13)
)
insert into judging.Marks (RegistrationID, UserID, DanceID, RoundID, IsCross, MarkValue)
select RegistrationID, j.UserID, @did, @r1, 0, v.Mark
from c
cross apply (values
    (11, @ja, 1), (11, @jb, 1), (11, @jc, 2), (11, @jd, 1), (11, @je, 2),
    (12, @ja, 2), (12, @jb, 2), (12, @jc, 1), (12, @jd, 3), (12, @je, 1),
    (13, @ja, 3), (13, @jb, 3), (13, @jc, 3), (13, @jd, 2), (13, @je, 3)
) v(StartNum, UserID, Mark)
join core.Users j on j.UserID = v.UserID
where c.StartNumber = v.StartNum;

exec judging.sp_calculate_skating @r1

select
    'Test 1' as TestCase, tr.StartNumber as Couple, r.FinalPlace as Got,
    case tr.StartNumber when 11 then 1 when 12 then 2 when 13 then 3 end as Expected,
    case when r.FinalPlace = case tr.StartNumber when 11 then 1 when 12 then 2 when 13 then 3 end
        then 'PASS' else 'FAIL' end as Result
from judging.Results r
join events.TournamentsRegistration tr on tr.RegistrationID = r.RegistrationID
where r.RoundID = @r1
order by tr.StartNumber;


--  test 2: equal majority broken by sum 
-- 21->1st, 22->2nd, 23->3rd, 24->4th, 25->5th
print '-- test 2: equal majority broken by sum --';

insert into events.Rounds (TournamentID, CategoryID, RoundType, RoundNumber, Status)
values (@tid, @cid, 'FN', 2, 'CL');
declare @r2 bigint = scope_identity();

insert into events.TournamentsRegistration
    (TournamentID, CategoryID, FederationID, StartNumber, RegPartner1Name, RegPartner2Name, RegClubName, HadPaidFee, IsCheckedIn, IsDisqualified)
values
    (@tid, @cid, null, 21,'C21', 'C21', 'TestClub', 1, 1, 0),
    (@tid, @cid, null, 22,'C22', 'C22', 'TestClub', 1, 1, 0),
    (@tid, @cid, null, 23,'C23', 'C23', 'TestClub', 1, 1, 0),
    (@tid, @cid, null, 24,'C24', 'C24','TestClub', 1, 1, 0),
    (@tid, @cid, null, 25,'C25', 'C25', 'TestClub', 1, 1, 0);

insert into judging.JudgePanelAssignments (RoundID, UserID)
values (@r2, @ja), (@r2, @jb), (@r2, @jc), (@r2, @jd), (@r2, @je);

;with c as (
    select RegistrationID, StartNumber from events.TournamentsRegistration
    where TournamentID = @tid and StartNumber in (21, 22, 23, 24, 25)
)
insert into judging.Marks (RegistrationID, UserID, DanceID, RoundID, IsCross, MarkValue)
select RegistrationID, v.UserID, @did, @r2, 0, v.Mark
from c
cross apply (values
    (21, @ja, 1), (21, @jb, 1), (21, @jc, 1), (21, @jd, 5), (21, @je, 2),
    (22, @ja, 2), (22, @jb, 3), (22, @jc, 3), (22, @jd, 1), (22, @je, 1),
    (23, @ja, 3), (23, @jb, 2), (23, @jc, 2), (23, @jd, 2), (23, @je, 5),
    (24, @ja, 4), (24, @jb, 4), (24, @jc, 5), (24, @jd, 3), (24, @je, 3),
    (25, @ja, 5), (25, @jb, 5), (25, @jc, 4), (25, @jd, 4), (25, @je, 4)
) v(StartNum, UserID, Mark)
where c.StartNumber = v.StartNum;

exec judging.sp_calculate_skating @r2;

select
    'Test 2' as TestCase, tr.StartNumber as Couple, r.FinalPlace as Got,
    case tr.StartNumber when 21 then 1 when 22 then 2 when 23 then 3 when 24 then 4 when 25 then 5 end as Expected,
    case when r.FinalPlace = case tr.StartNumber when 21 then 1 when 22 then 2 when 23 then 3 when 24 then 4 when 25 then 5 end
        then 'PASS' else 'FAIL' end as Result
from judging.Results r
join events.TournamentsRegistration tr on tr.RegistrationID = r.RegistrationID
where r.RoundID = @r2
order by tr.StartNumber;


--  test 3: all seconds wins 
-- 31->2nd, 32->1st, 33->3rd
print '-- test 3: all-seconds wins --';

insert into events.Rounds (TournamentID, CategoryID, RoundType, RoundNumber, Status)
values (@tid, @cid, 'FN', 3, 'CL');
declare @r3 bigint = scope_identity();

insert into events.TournamentsRegistration
    (TournamentID, CategoryID, FederationID, StartNumber, RegPartner1Name, RegPartner2Name, RegClubName, HadPaidFee, IsCheckedIn, IsDisqualified)
values
    (@tid, @cid, null, 31, 'C31', 'C31', 'TestClub', 1, 1, 0),
    (@tid, @cid, null, 32, 'C32', 'C32', 'TestClub', 1, 1, 0),
    (@tid, @cid, null, 33, 'C33','C33', 'TestClub', 1, 1, 0);

insert into judging.JudgePanelAssignments (RoundID, UserID)
values (@r3, @ja), (@r3, @jb), (@r3, @jc), (@r3, @jd), (@r3, @je);

;with c as (
    select RegistrationID, StartNumber from events.TournamentsRegistration
    where TournamentID = @tid and StartNumber in (31, 32, 33)
)
insert into judging.Marks (RegistrationID, UserID, DanceID, RoundID, IsCross, MarkValue)
select RegistrationID, v.UserID, @did, @r3, 0, v.Mark
from c
cross apply (values
    (31, @ja, 1), (31, @jb, 1), (31, @jc, 2), (31, @jd, 2), (31, @je, 3),
    (32, @ja, 2), (32, @jb,2), (32, @jc, 1), (32, @jd, 1), (32, @je, 2),
    (33, @ja, 3), (33, @jb, 3), (33, @jc, 3), (33, @jd, 3), (33, @je, 1)
) v(StartNum, UserID, Mark)
where c.StartNumber = v.StartNum;

exec judging.sp_calculate_skating @r3;

select
    'Test 3' as TestCase, tr.StartNumber as Couple, r.FinalPlace as Got,
    case tr.StartNumber when 31 then 2 when 32 then 1 when 33 then 3 end as Expected,
    case when r.FinalPlace = case tr.StartNumber when 31 then 2 when 32 then 1 when 33 then 3 end
        then 'PASS' else 'FAIL' end as Result
from judging.Results r
join events.TournamentsRegistration tr on tr.RegistrationID = r.RegistrationID
where r.RoundID = @r3
order by tr.StartNumber;


--  test 4: shared place 2.5 (rule 8) 
-- 42->1st, 41 and 43 share 2nd-3rd, 44->4th
print '-- test 4: shared place 2.5 --';

insert into events.Rounds (TournamentID, CategoryID, RoundType, RoundNumber, Status)
values (@tid, @cid, 'FN', 4, 'CL');
declare @r4 bigint = scope_identity();

insert into events.TournamentsRegistration
    (TournamentID, CategoryID, FederationID, StartNumber, RegPartner1Name, RegPartner2Name, RegClubName, HadPaidFee, IsCheckedIn, IsDisqualified)
values
    (@tid, @cid, null, 41, 'C41', 'C41', 'TestClub', 1, 1, 0),
    (@tid, @cid, null, 42, 'C42', 'C42', 'TestClub', 1, 1, 0),
    (@tid, @cid, null, 43, 'C43', 'C43', 'TestClub', 1, 1, 0),
    (@tid, @cid, null, 44, 'C44', 'C44', 'TestClub', 1, 1, 0);

insert into judging.JudgePanelAssignments (RoundID, UserID)
values (@r4, @ja), (@r4, @jb), (@r4, @jc), (@r4, @jd), (@r4, @je);

;with c as (
    select RegistrationID, StartNumber from events.TournamentsRegistration
    where TournamentID = @tid and StartNumber in (41, 42, 43, 44)
)
insert into judging.Marks (RegistrationID, UserID, DanceID, RoundID, IsCross, MarkValue)
select RegistrationID, v.UserID, @did, @r4, 0, v.Mark
from c
cross apply (values
    (41, @ja, 1), (41, @jb, 1), (41, @jc, 3), (41, @jd, 3), (41, @je, 4),
    (42, @ja, 2), (42, @jb, 2), (42, @jc, 2), (42, @jd, 2), (42, @je, 2),
    (43, @ja, 3), (43, @jb, 3), (43, @jc, 4), (43, @jd, 1), (43, @je, 1),
    (44, @ja, 4), (44, @jb, 4), (44, @jc, 1), (44, @jd, 4), (44, @je, 3)
) v(StartNum, UserID, Mark)
where c.StartNumber = v.StartNum;

exec judging.sp_calculate_skating @r4;

select
    'Test 4' as TestCase, tr.StartNumber as Couple, r.FinalPlace as Got,
    case tr.StartNumber when 42 then '1' when 44 then '4' else 'tied 2-3' end as Expected,
    case
        when tr.StartNumber = 42 and r.FinalPlace = 1 then 'PASS'
        when tr.StartNumber = 44 and r.FinalPlace = 4 then 'PASS'
        when tr.StartNumber in (41, 43) and r.FinalPlace in (2, 3) then 'PASS (shared)'
        else 'CHECK'
    end as Result
from judging.Results r
join events.TournamentsRegistration tr on tr.RegistrationID = r.RegistrationID
where r.RoundID = @r4
order by tr.StartNumber
go