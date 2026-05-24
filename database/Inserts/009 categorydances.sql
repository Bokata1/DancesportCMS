use DancesportCMS
go

--shows which dances are danced in each category *(Juvenile I and Juvenile II have less dances)

insert into core.CategoryDances (CategoryID, DanceID, OrderNumber)
select c.CategoryID, d.DanceID,
    case d.Name
        when 'Samba' then 1
        when 'Cha-Cha' then 2
        when 'Rumba' then 3
        when 'Paso Doble' then 4
        when 'Jive' then 5
    end
from core.Categories c
cross join core.Dances d
where c.DanceStyle = 'LA'
  and d.DanceStyle = 'LA'
  and c.AgeGroup not in ('Juvenile I','Juvenile II');


  --all standart dances

  insert into core.CategoryDances (CategoryID, DanceID, OrderNumber)
select c.CategoryID, d.DanceID,
    case d.Name
        when 'Waltz' then 1
        when 'Tango' then 2
        when 'Viennese Waltz'  then 3
        when 'Foxtrot' then 4
        when 'Quickstep' then 5
    end
from core.Categories c
cross join core.Dances d
where c.DanceStyle = 'ST'
  and d.DanceStyle = 'ST'
  and c.AgeGroup not in ('Juvenile I','Juvenile II');


  --Juvenile I LA - Cha-Cha and Jive

  insert into core.CategoryDances (CategoryID, DanceID, OrderNumber)
select c.CategoryID, d.DanceID,
    case d.Name when 'Cha-Cha' then 1 when 'Jive' then 2 end
from core.Categories c
cross join core.Dances d
where c.AgeGroup = 'Juvenile I' and c.DanceStyle = 'LA'
  and d.Name in ('Cha-Cha', 'Jive');

   --Juvenile I St - Waltz and QuickStep

   insert into core.CategoryDances (CategoryID, DanceID, OrderNumber)
select c.CategoryID, d.DanceID,
    case d.Name when 'Waltz' then 1 when 'Quickstep' then 2 end
from core.Categories c
cross join core.Dances d
where c.AgeGroup = 'Juvenile I' and c.DanceStyle = 'ST'
  and d.Name in ('Waltz', 'Quickstep');

    --Juvenile II LA - Cha-Cha ,Rumba and Jive

    insert into core.CategoryDances (CategoryID, DanceID, OrderNumber)
select c.CategoryID, d.DanceID,
    case d.Name 
        when 'Cha-Cha' then 1 
        when 'Rumba' then 2 
        when 'Jive' then 3 
    end
from core.Categories c
cross join core.Dances d
where c.AgeGroup = 'Juvenile II' and c.DanceStyle = 'LA'
  and d.Name in ('Cha-Cha','Rumba','Jive');
 

    --Juvenile II St - Waltz and QuickStep

    insert into core.CategoryDances (CategoryID, DanceID, OrderNumber)
select c.CategoryID, d.DanceID,
    case d.Name 
        when 'Waltz' then 1 
        when 'Tango' then 2 
        when 'Quickstep' then 3 
    end
from core.Categories c
cross join core.Dances d
where c.AgeGroup = 'Juvenile II' and c.DanceStyle = 'ST'
  and d.Name in ('Waltz','Tango','Quickstep');
go

