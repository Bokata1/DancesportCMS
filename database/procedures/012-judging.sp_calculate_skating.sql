
create or alter procedure judging.sp_calculate_skating
    @p_RoundID bigint
as
begin
    set nocount on


    declare @p_judges  int = (select count(*) from judging.JudgePanelAssignments where RoundID = @p_RoundID);
    declare @p_couples int = (select count(distinct RegistrationID) from judging.Marks where RoundID = @p_RoundID);

    if @p_judges = 0 or @p_couples = 0 return;

    declare @maj int = @p_judges / 2 + 1

    delete from judging.Results where RoundID = @p_RoundID
    delete from judging.DancePlacements where RoundID = @p_RoundID


    ;with t as (
        select 1 as p
        union all
        select p + 1 from t where p < @p_couples
    ),
    cum as (
        select m.RegistrationID, m.DanceID, t.p,count(*) as c,sum(m.MarkValue) as s
        from judging.Marks m
        cross join t
        where  m.RoundID = @p_RoundID
          and  m.MarkValue <= t.p
        group by m.RegistrationID, m.DanceID, t.p
    ),
    got_majority as (
        select RegistrationID, DanceID, min(p) as firstP
        from cum
        where c >= @maj
        group by RegistrationID, DanceID
    ),
    keys as (
        select gm.RegistrationID, gm.DanceID, gm.firstP, c.c, c.s
        from got_majority gm
        join cum c on c.RegistrationID = gm.RegistrationID
                    and c.DanceID = gm.DanceID
                    and c.p = gm.firstP
    ),
    ranked as (
        select RegistrationID, DanceID,
               rank() over (partition by DanceID order by firstP, c desc, s) as start_pl,
               count(*) over (partition by DanceID, firstP, c, s) as tied
        from keys
    )
    insert into judging.DancePlacements (RegistrationID, DanceID, RoundID, DancePlacement)
    select RegistrationID, DanceID, @p_RoundID,
           cast(start_pl * 2 + tied - 1 as numeric(5,2)) / 2.0
    from ranked
    option (maxrecursion 0);


    -- overall: smaller total of per-dance places wins.
    -- tie  more high places wins (1sts, then 2nds...).
    
    ;with totals as (
        select RegistrationID,sum(DancePlacement) as total
        from judging.DancePlacements
        where RoundID = @p_RoundID
        group by RegistrationID
    ),
    raw as (
        select RegistrationID, sum(MarkValue) as raw_sum
        from judging.Marks
        where RoundID = @p_RoundID
        group by RegistrationID
    ),
    breakers as (
        select t.RegistrationID, t.total, r.raw_sum,
               sum(case when dp.DancePlacement <= 1 then 1 else 0 end) as f1,
               sum(case when dp.DancePlacement <= 2 then 1 else 0 end) as f2,
               sum(case when dp.DancePlacement <= 3 then 1 else 0 end) as f3,
               sum(case when dp.DancePlacement <= 4 then 1 else 0 end) as f4,
               sum(case when dp.DancePlacement <= 5 then 1 else 0 end) as f5,
               sum(case when dp.DancePlacement <= 6 then 1 else 0 end) as f6
        from totals t
        join raw r on r.RegistrationID = t.RegistrationID
        join judging.DancePlacements dp on dp.RegistrationID = t.RegistrationID
                                          and dp.RoundID = @p_RoundID
        group  by t.RegistrationID, t.total, r.raw_sum
    )
    insert into judging.Results (RegistrationID, RoundID, FinalPlace, EarnedPoints, IsOfficial)
    select RegistrationID, @p_RoundID,
           rank() over (order by total,
                                 f1 desc, f2 desc, f3 desc,
                                 f4 desc, f5 desc, f6 desc,
                                 raw_sum),
           null,    
           1      
    from   breakers;
      update judging.Results
    set EarnedPoints = case FinalPlace
        when 1 then 60
        when 2 then 50
        when 3 then 40
        when 4 then 30
        when 5 then 20
        when 6 then 10
        else 0
    end
where RoundID = @p_RoundID
end
go