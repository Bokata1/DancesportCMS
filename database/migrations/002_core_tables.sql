use DancesportCMS;


create table core.Users (
	UserID bigint Primary Key identity(1,1),
	Email nvarchar(255) not null unique,
	Salt nvarchar(255) not null,
	Password nvarchar(255) not null,
	FName nvarchar(100) not null,
	LName nvarchar(100) not null,
	JudgeLicense nvarchar(100) null,
	IsAdmin bit not null default 0,
	IsJudge bit not null default 0,
	IsUser bit not null default 1,
	CreatedAt datetime2 not null default getdate()

);
go
alter table core.Users
add IsRulesJudge bit not null default 0;

go

alter table core.Users
add JudgePIN nvarchar(4) null;

go

create table core.FederationCouples (
	CoupleID bigint Primary Key identity(1,1),
	Partner1Name nvarchar(100) not null,
	Partner2Name nvarchar(100) not null,
	ClubName nvarchar(100) not null,
	IsActive bit not null default 1
);

create table core.Categories (
	CategoryID bigint Primary Key identity(1,1),
	AgeGroup nvarchar(100) not null,
	Class nvarchar(50) null,
	DanceStyle nvarchar(2) not null,

	Constraint CHK_Categories_DanceStyle 
    Check (DanceStyle in ('LA', 'ST')),

    Constraint UQ_Categories_Unique
    UNIQUE (AgeGroup, Class, DanceStyle)

);

create table core.Dances (
	DanceID bigint Primary Key identity(1,1),
	Name nvarchar(100) not null,
	DanceStyle nvarchar(2) not null,

	Constraint CHK_Dances_DanceStyle 
    Check (DanceStyle in ('LA', 'ST'))

);

create table core.CategoryDances (
	CategoryID bigint not null, 
	DanceID bigint not null ,
	OrderNumber int not null,

	Constraint PK_CategoryDances
	Primary Key (CategoryID,DanceID),

	Constraint FK_CategoryDances_Category
	Foreign Key (CategoryID) REFERENCES core.Categories(CategoryID),

	Constraint FK_CategoryDances_Dance
	Foreign Key (DanceID) REFERENCES core.Dances(DanceID)

);
