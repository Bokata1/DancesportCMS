use DancesportCMS;
go
 
insert into core.Users (Email, Salt, Password, FName, LName, JudgeLicense, IsAdmin, IsJudge, IsUser)
values
    ('admin@bgdsf.bg',  'salt001', 'pass001', 'Иван',    'Иванов',   null,       1, 0, 1),
    ('judge1@bgdsf.bg', 'salt002', 'pass002', 'Петър',   'Петров',   'BG-J-001', 0, 1, 1),
    ('judge2@bgdsf.bg', 'salt003', 'pass003', 'Георги',  'Георгиев', 'BG-J-002', 0, 1, 1),
    ('judge3@bgdsf.bg', 'salt004', 'pass004', 'Мария',   'Маринова', 'BG-J-003', 0, 1, 1),
    ('judge4@bgdsf.bg', 'salt005', 'pass005', 'Елена',   'Стоянова', 'BG-J-004', 0, 1, 1),
    ('judge5@bgdsf.bg', 'salt006', 'pass006', 'Николай', 'Николов',  'BG-J-005', 0, 1, 1);
go

update core.Users set JudgePIN = '1001' where Email = 'judge1@bgdsf.bg';
update core.Users set JudgePIN = '1002' where Email = 'judge2@bgdsf.bg';
update core.Users set JudgePIN = '1003' where Email = 'judge3@bgdsf.bg'; 
update core.Users set JudgePIN = '1004' where Email = 'judge4@bgdsf.bg';
update core.Users set JudgePIN = '1005' where Email = 'judge5@bgdsf.bg';
go

