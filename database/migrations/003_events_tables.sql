
create table events.Tournaments (
	TournamentID bigint Primary Key identity(1,1),
	TournamentName nvarchar(255) not null unique,
	TournamentDate datetime2 not null default getdate(),
	Location nvarchar(255) not null,
	IsRegistrationOpen bit default 0,
	IsFinished bit default 0

)

create table events.TournamentsRegistration (
	RegistrationID bigint Primary Key identity(1,1),
	TournamentID bigint not null,
	CategoryID bigint not null,  
	FederationID bigint  null,
	StartNumber bigint not null, -- should be random generated 
	RegPartner1Name nvarchar(255) not null,
	RegPartner2Name nvarchar(255),
	RegClubName nvarchar(255) not null,
	HadPaidFee bit default 1,
	IsCheckedIn bit default 1,
	IsDisqualified bit default 0,
	RegisteredAt datetime2 default getdate(),

	Constraint FK_TournamentsRegistration_Tournament
	Foreign Key (TournamentID) REFERENCES events.Tournaments(TournamentID),

	Constraint FK_TournamentsRegistration_Category
	Foreign Key (CategoryID) REFERENCES core.Categories(CategoryID),

	Constraint FK_TournamentsRegistration_FederationCouples
	Foreign Key (FederationID) REFERENCES core.FederationCouples(CoupleID)

)

create table events.Rounds(
	RoundID bigint Primary Key identity(1,1),
	TournamentID bigint not null,
	CategoryID bigint not null,
	RoundType nvarchar(2) not null,
	RoundNumber int not null, 
	Status  nvarchar(2) not null,
	CreatedAt datetime2 default getdate(),

	Constraint FK_Rounds_Tournament
	Foreign Key (TournamentID) REFERENCES events.Tournaments(TournamentID),

	CONSTRAINT FK_Rounds_Category
    FOREIGN KEY (CategoryID) REFERENCES core.Categories(CategoryID),

	CONSTRAINT CHK_Rounds_Status
		CHECK (Status IN ('PN', 'AC', 'CL')),

	CONSTRAINT CHK_Rounds_RoundType
    CHECK (RoundType IN ('QL', 'QF', 'SF', 'FN'))
)
go
alter table events.Rounds
add CouplesToAdvance int null
go


create table events.Heats(
	HeatID bigint Primary Key identity(1,1),
	RoundId bigint not null,
	HeatNumber int not null, 
	Status nvarchar(2) not null, 

	CONSTRAINT CHK_Heats_Status
    CHECK (Status IN ('PN', 'AC', 'CL')),

	CONSTRAINT FK_Heats_Round
    FOREIGN KEY (RoundId) REFERENCES events.Rounds(RoundID)
)

create table events.HeatsEnties(

	HeatID bigint not null,
	RegistrationID bigint not null ,

	CONSTRAINT PK_HeatEntries
        PRIMARY KEY (HeatID, RegistrationID),

	CONSTRAINT FK_HeatEntries_Heat
        FOREIGN KEY (HeatID) REFERENCES events.Heats(HeatID),

    CONSTRAINT FK_HeatEntries_Registration
        FOREIGN KEY (RegistrationID) REFERENCES events.TournamentsRegistration(RegistrationID)
)



