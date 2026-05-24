create or alter procedure judging.sp_finalize_tournament
    @p_TournamentID bigint
    
as
begin
    set nocount on

    declare @p_cid bigint

        declare c cursor local fast_forward for
            select  distinct CategoryID
            from events.Rounds
            where TournamentID =@p_TournamentID
                and Status = 'CL'

            open c;
        fetch next from c into @p_cid

        while @@FETCH_STATUS = 0
            begin 
                    exec judging.sp_finalize_category

                fetch next from c into @p_cid
                end
            close c
            deallocate c

        end
        go


