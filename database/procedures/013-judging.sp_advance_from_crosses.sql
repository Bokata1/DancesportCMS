create or alter procedure judging.sp_advance_from_crosses
    @p_RoundID bigint
as
begin
    set nocount on

    declare @p_toAdvance int  = (select CouplesToAdvance from events.Rounds where RoundID = @p_RoundID)

    if @p_toAdvance is null return; -- check for finals where CouplesToAdvance = null)

    delete from judging.RoundAdvancements where RoundID = @p_RoundID;

    ;with counts as (
        select RegistrationID,sum(cast(IsCross as int)) as numb_crosses
        from judging.Marks
        where RoundID = @p_RoundID
        group by RegistrationID
        ),
        ranked as (
            select RegistrationID,numb_crosses,rank() over (order by numb_crosses desc) as position
            from counts
            )

            insert into judging.RoundAdvancements (RoundID,RegistrationID,CrossCount,Advanced)
            select @p_RoundID,RegistrationID,numb_crosses,
                case when position <=@p_toAdvance then 1 else 0 end
                from ranked
        end
        go


