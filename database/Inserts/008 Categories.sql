
use DancesportCMS;
go



-- E class 
insert into core.Categories (AgeGroup, Class, DanceStyle) values
    ('9','E','LA'),('9','E','ST'),
    ('11','E','LA'),('11','E','ST'),
    ('13','E','LA'),('13','E','ST');

-- D class
insert into core.Categories (AgeGroup, Class, DanceStyle) values
    ('9','D','LA'),('9','D','ST'),
    ('11','D','LA'),('11','D','ST'),
    ('13','D','LA'),('13','D','ST'),
    ('15','D','LA'),('15','D','ST'),
    ('18','D','LA'),('18','D','ST');

-- C class 
insert into core.Categories (AgeGroup, Class, DanceStyle) values
    ('11','C','LA'),('11','C','ST'),
    ('13','C','LA'),('13','C','ST'),
    ('15','C','LA'),('15','C','ST'),
    ('18','C','LA'),('18','C','ST');

-- B class 
insert into core.Categories (AgeGroup, Class, DanceStyle) values
    ('15','B','LA'),('15','B','ST'),
    ('18','B','LA'),('18','B','ST');

-- A class
insert into core.Categories (AgeGroup, Class, DanceStyle) values
    ('18','A','LA'), ('18','A','ST');

-- M clas
insert into core.Categories (AgeGroup, Class, DanceStyle) values
    ('18','M','LA'),('18','M','ST');


insert into core.Categories (AgeGroup, Class, DanceStyle) values
    ('Juvenile I',null, 'LA'),
    ('Juvenile I',null, 'ST'),  
    ('Juvenile II',null, 'LA'),  
    ('Juvenile II',null, 'ST');  

    go

insert into core.Categories (AgeGroup, Class, DanceStyle) values
    ('Junior I', null, 'LA'), ('Junior I', null, 'ST'),
    ('Junior II', null, 'LA'), ('Junior II', null, 'ST'),
    ('Youth', null, 'LA'), ('Youth', null, 'ST'),
    ('Under 21', null, 'LA'), ('Under 21', null, 'ST'),
    ('Adult', null, 'LA'), ('Adult', null, 'ST');
go





