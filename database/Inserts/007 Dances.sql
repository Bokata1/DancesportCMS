use DancesportCMS;
go
 
insert into core.Dances (Name, DanceStyle)
values
    -- latin
    ('Samba','LA'),
    ('Cha-Cha','LA'),
    ('Rumba', 'LA'),
    ('Paso Doble','LA'),
    ('Jive','LA'),
    -- standard 
    ('Waltz','ST'),
    ('Tango','ST'),
    ('Viennese Waltz','ST'),
    ('Foxtrot','ST'),
    ('Quickstep','ST');
go