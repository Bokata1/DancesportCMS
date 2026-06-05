use DancesportCMS;
go

-- create a new tournament
insert into events.Tournaments
    (TournamentName, TournamentDate, Location, IsRegistrationOpen, IsFinished)
values
    ('Демо турнир — Май 2026', '2026-05-26', 'София', 0, 0);

declare @TID bigint = scope_identity();

-- find Adult Latin category
declare @CatID bigint;
select top 1 @CatID = CategoryID
from core.Categories
where AgeGroup = 'Adult' and DanceStyle = 'LA';

-- register 6 demo couples
insert into events.TournamentsRegistration
    (TournamentID, FederationID, CategoryID,
     RegPartner1Name, RegPartner2Name, RegClubName, StartNumber)
values
    (@TID, null, @CatID, 'Александър Петров', 'Виктория Иванова', 'Клуб Олимпия',  10),
    (@TID, null, @CatID, 'Георги Иванов',     'Мария Стоянова',   'Клуб Феникс',    20),
    (@TID, null, @CatID, 'Никола Димитров',   'Елена Петрова',    'Клуб Виктория',  30),
    (@TID, null, @CatID, 'Стефан Стоянов',    'Анна Костова',     'Клуб Сириус',    40),
    (@TID, null, @CatID, 'Петър Кирилов',     'София Колева',     'Клуб Орхидея',   50),
    (@TID, null, @CatID, 'Мартин Йорданов',   'Дарина Маринова',  'Клуб Меркурий',  60);

-- create the final round (status = active so judges can mark)
insert into events.Rounds
    (TournamentID, CategoryID, RoundType, RoundNumber, Status)
values
    (@TID, @CatID, 'FN', 1, 'AC');

declare @RoundID bigint = scope_identity();

-- assign all 5 Bulgarian judges to this round
insert into judging.JudgePanelAssignments (RoundID, UserID)
select @RoundID, UserID 
from core.Users
where IsJudge = 1 and JudgePIN is not null;

print 'Demo tournament created!';
print 'TournamentID: ' + cast(@TID as nvarchar);
print 'RoundID: ' + cast(@RoundID as nvarchar);