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
                and Status = 'AC'

            open c;
        fetch next from c into @p_cid

        while @@FETCH_STATUS = 0
            begin 
                    exec judging.sp_finalize_category
                    @p_TournamentID = @p_TournamentID,
                    @p_CategoryID = @p_cid

                fetch next from c into @p_cid
                end
            close c
            deallocate c

                    update events.Tournaments
                    set IsFinished = 1,
                    IsRegistrationOpen = 0
                    where TournamentID = @p_TournamentID


        end
        go


