
delete c
from core.categorydances c
inner join core.categories cc on cc.categoryid = c.categoryid
inner join core.dances d on d.danceid = c.danceid
where cc.agegroup = '9' 
	and cc.class = 'e'
	and d.name in ('samba', 'rumba', 'paso doble', 'tango', 'viennese waltz', 'foxtrot')

	delete c
from core.categorydances c
inner join core.categories cc on cc.categoryid = c.categoryid
inner join core.dances d on d.danceid = c.danceid
where cc.agegroup = '13' 
	and cc.class = 'e'
	and d.name in ('samba',  'paso doble', 'viennese waltz', 'foxtrot')

		delete c
from core.categorydances c
inner join core.categories cc on cc.categoryid = c.categoryid
inner join core.dances d on d.danceid = c.danceid
where cc.agegroup = '13' 
	and cc.class = 'e'
	and d.name in ('samba',  'paso doble', 'viennese waltz', 'foxtrot')

	delete c
from core.categorydances c
inner join core.categories cc on cc.categoryid = c.categoryid
inner join core.dances d on d.danceid = c.danceid
where cc.agegroup = 'Junior I' 
	--and cc.class = 'e'
	and d.name in ('samba', 'rumba', 'paso doble', 'tango', 'viennese waltz', 'foxtrot')

		delete c
from core.categorydances c
inner join core.categories cc on cc.categoryid = c.categoryid
inner join core.dances d on d.danceid = c.danceid
where cc.agegroup = 'Junior II' 
	--and cc.class = 'e'
	and d.name in ('samba',  'paso doble', 'viennese waltz', 'foxtrot')


			delete c
from core.categorydances c
inner join core.categories cc on cc.categoryid = c.categoryid
inner join core.dances d on d.danceid = c.danceid
where cc.agegroup = '11' 
	and cc.class = 'D'
	and d.name in ('samba',  'paso doble', 'viennese waltz', 'foxtrot')

			delete c
from core.categorydances c
inner join core.categories cc on cc.categoryid = c.categoryid
inner join core.dances d on d.danceid = c.danceid
where cc.agegroup = '13' 
	and cc.class = 'D'
	and d.name in ('samba',  'paso doble', 'viennese waltz', 'foxtrot')

		delete c
from core.categorydances c
inner join core.categories cc on cc.categoryid = c.categoryid
inner join core.dances d on d.danceid = c.danceid
where cc.agegroup = '11' 
	and cc.class = 'C'
	and d.name in ( 'paso doble',  'foxtrot')

		delete c
from core.categorydances c
inner join core.categories cc on cc.categoryid = c.categoryid
inner join core.dances d on d.danceid = c.danceid
where cc.agegroup = '13' 
	and cc.class = 'C'
	and d.name in ( 'paso doble',  'foxtrot')
		
		delete c
from core.categorydances c
inner join core.categories cc on cc.categoryid = c.categoryid
inner join core.dances d on d.danceid = c.danceid
where cc.agegroup = '15' 
	and cc.class = 'C'
	and d.name in ( 'paso doble',  'foxtrot')