use DancesportCMS;
go


insert into events.Tournaments (TournamentName, TournamentDate, Location, IsRegistrationOpen, IsFinished)
values ('Купа България 2026', '2026-04-15', 'София', 0, 1);
go

declare @TournamentID bigint = (
    select TournamentID from events.Tournaments 
    where TournamentName = 'Купа България 2026'
);
 
declare @CategoryID bigint = (
    select CategoryID from core.Categories 
    where AgeGroup = 'Youth' and DanceStyle = 'LA' and Class is null
);
 
insert into events.TournamentsRegistration
    (TournamentID, CategoryID, FederationID, StartNumber, 
     RegPartner1Name, RegPartner2Name, RegClubName, 
     HadPaidFee, IsCheckedIn, IsDisqualified)
values
    (@TournamentID, @CategoryID, 1, 11, 'Александър Димитров', 'София Тодорова', 'Алекс Пловдив', 1, 1, 0),
    (@TournamentID, @CategoryID, 2, 12, 'Виктор Петков', 'Анна Колева', 'Дъга София', 1, 1, 0),
    (@TournamentID, @CategoryID, 3, 13, 'Стефан Райков', 'Габриела Илиева', 'Ритъм Варна', 1, 1, 0),
    (@TournamentID, @CategoryID, 4, 14, 'Мартин Стефанов', 'Елица Василева', 'Импулс София', 1, 1, 0),
    (@TournamentID, @CategoryID, 5, 15, 'Любомир Драгов', 'Калина Михайлова','Нефтохимик Бургас', 1, 1, 0);
go
 
-- create the final round

declare @TournamentID bigint = (
    select TournamentID from events.Tournaments 
    where TournamentName = 'Купа България 2026'
);
 
declare @CategoryID bigint = (
    select CategoryID from core.Categories 
    where AgeGroup = 'Youth' and DanceStyle = 'LA' and Class is null
);
 
insert into events.Rounds (TournamentID, CategoryID, RoundType, RoundNumber, Status)
values (@TournamentID, @CategoryID, 'FN', 1, 'CL');
go
 

-- assign all 5 judges to the final round

declare @RoundID bigint = (select top 1 RoundID from events.Rounds order by RoundID desc);
 
insert into judging.JudgePanelAssignments (RoundID, UserID)
select @RoundID, UserID from core.Users where IsJudge = 1;
go
 
-- 5. insert Cha-Cha 

declare @RoundID bigint = (select top 1 RoundID from events.Rounds order by RoundID desc);
declare @DanceID bigint = (select DanceID from core.Dances where Name = 'Cha-Cha');
 
declare @Reg11 bigint = (select RegistrationID from events.TournamentsRegistration where StartNumber = 11);
declare @Reg12 bigint = (select RegistrationID from events.TournamentsRegistration where StartNumber = 12);
declare @Reg13 bigint = (select RegistrationID from events.TournamentsRegistration where StartNumber = 13);
declare @Reg14 bigint = (select RegistrationID from events.TournamentsRegistration where StartNumber = 14);
declare @Reg15 bigint = (select RegistrationID from events.TournamentsRegistration where StartNumber = 15);
 
declare @J1 bigint = (select UserID from core.Users where Email = 'judge1@bgdsf.bg');
declare @J2 bigint = (select UserID from core.Users where Email = 'judge2@bgdsf.bg');
declare @J3 bigint = (select UserID from core.Users where Email = 'judge3@bgdsf.bg');
declare @J4 bigint = (select UserID from core.Users where Email = 'judge4@bgdsf.bg');
declare @J5 bigint = (select UserID from core.Users where Email = 'judge5@bgdsf.bg');
 
insert into judging.Marks (RegistrationID, UserID, DanceID, RoundID, IsCross, MarkValue)
values
    -- couple 11
    (@Reg11, @J1, @DanceID, @RoundID, 0, 1),
    (@Reg11, @J2, @DanceID, @RoundID, 0, 1),
    (@Reg11, @J3, @DanceID, @RoundID, 0, 1),
    (@Reg11, @J4, @DanceID, @RoundID, 0, 5),
    (@Reg11, @J5, @DanceID, @RoundID, 0, 2),
    -- couple 12
    (@Reg12, @J1, @DanceID, @RoundID, 0, 2),
    (@Reg12, @J2, @DanceID, @RoundID, 0, 3),
    (@Reg12, @J3, @DanceID, @RoundID, 0, 3),
    (@Reg12, @J4, @DanceID, @RoundID, 0, 1),
    (@Reg12, @J5, @DanceID, @RoundID, 0, 1),
    -- couple 13
    (@Reg13, @J1, @DanceID, @RoundID, 0, 3),
    (@Reg13, @J2, @DanceID, @RoundID, 0, 2),
    (@Reg13, @J3, @DanceID, @RoundID, 0, 2),
    (@Reg13, @J4, @DanceID, @RoundID, 0, 2),
    (@Reg13, @J5, @DanceID, @RoundID, 0, 5),
    -- couple 14
    (@Reg14, @J1, @DanceID, @RoundID, 0, 4),
    (@Reg14, @J2, @DanceID, @RoundID, 0, 4),
    (@Reg14, @J3, @DanceID, @RoundID, 0, 5),
    (@Reg14, @J4, @DanceID, @RoundID, 0, 3),
    (@Reg14, @J5, @DanceID, @RoundID, 0, 3),
    -- couple 15
    (@Reg15, @J1, @DanceID, @RoundID, 0, 5),
    (@Reg15, @J2, @DanceID, @RoundID, 0, 5),
    (@Reg15, @J3, @DanceID, @RoundID, 0, 4),
    (@Reg15, @J4, @DanceID, @RoundID, 0, 4),
    (@Reg15, @J5, @DanceID, @RoundID, 0, 4);
go
 
