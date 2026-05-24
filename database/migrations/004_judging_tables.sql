create table judging.JudgePanelAssignments (
    AssignmentID bigint primary key identity(1,1),
    RoundID bigint not null,
    UserID bigint not null,

    constraint FK_JudgePanelAssignments_Round
        foreign key (RoundID) references events.Rounds(RoundID),

    constraint FK_JudgePanelAssignments_User
        foreign key (UserID) references core.Users(UserID),

    constraint UQ_JudgePanelAssignments
        unique (RoundID, UserID)
)

create table judging.Marks (
    MarkID bigint primary key identity(1,1),
    RegistrationID  bigint not null,
    UserID bigint not null,
    DanceID bigint not null,
    RoundID bigint not null,
    IsCross bit null,
    MarkValue int null,
    MarkedAt datetime2 not null default getdate(),
    
    constraint FK_Marks_Registration
        foreign key (RegistrationID) references events.TournamentsRegistration(RegistrationID),

    constraint FK_Marks_User
        foreign key (UserID) references core.Users(UserID),

    constraint FK_Marks_Dance
        foreign key (DanceID) references core.Dances(DanceID),

    constraint FK_Marks_Round
        foreign key (RoundID) references events.Rounds(RoundID),

    constraint CHK_Marks_Logic
        check (
            (IsCross = 1 and MarkValue is null)
            or
            (IsCross = 0 and MarkValue between 1 and 6)
            or
            (IsCross is null and MarkValue is null)
        )
)
go

alter table judging.Marks
drop constraint CHK_Marks_Logic;
go

alter table judging.Marks
add constraint CHK_Marks_Logic
    check (
        (IsCross = 1 and MarkValue is null)
        or
        (IsCross = 0 and MarkValue >= 1)
        or
        (IsCross is null and MarkValue is null)
    );
go



create table judging.Results (
    ResultID bigint primary key identity(1,1),
    RegistrationID  bigint not null,
    RoundID bigint not null,
    FinalPlace int null,
    EarnedPoints int null,
    CalculatedAt datetime2 not null default getdate(),
    IsOfficial bit not null default 0,

    constraint FK_Results_Registration
        foreign key (RegistrationID) references events.TournamentsRegistration(RegistrationID),

    constraint FK_Results_Round
        foreign key (RoundID) references events.Rounds(RoundID),

    constraint UQ_Results_Unique
        unique (RegistrationID, RoundID)
)

create table judging.DancePlacements (
    DancePlacementID bigint primary key identity(1,1),
    RoundID bigint not null,
    RegistrationID bigint not null,
    DanceID bigint not null,
    DancePlacement numeric(5,2) not null,
    CalculatedAt datetime2 not null default getdate(),

    constraint FK_DancePlacements_Round
    foreign key (RoundID) references events.Rounds(RoundID),

    constraint FK_DancePlacements_Registration
    foreign key (RegistrationID) references events.TournamentsRegistration(RegistrationID),

    constraint FK_DancePlacements_Dance
    foreign key (DanceID) references core.Dances(DanceID),

    constraint UQ_DancePlacements
    unique (RoundID, RegistrationID, DanceID)
)
go
create table judging.RoundAdvancements (
	AdvancementID bigint primary key identity (1,1),
	RoundID bigint not null,
    RegistrationID bigint not null,
	CrossCount int not null,
	Advanced bit not null,
	CalculatedAt datetime2 not null default getdate(),
	constraint FK_RoundAdvancements_Round
    foreign key (RoundID) references events.Rounds(RoundID),

    constraint FK_RoundAdvancements_Registration
    foreign key (RegistrationID) references events.TournamentsRegistration(RegistrationID),

    constraint UQ_RoundAdvancements
    unique (RoundID,RegistrationID)
	)