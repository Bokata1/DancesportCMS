create or alter procedure judging.sp_finalize_category
    @p_TournamentID bigint,
    @p_CategoryID bigint
as
begin
    set nocount on

    declare @p_rid bigint,
            @p_rtyp nvarchar (2)

        declare c cursor local fast_forward for
            select RoundID, RoundType
            from events.Rounds
            where TournamentID =@p_TournamentID
                and CategoryID = @p_CategoryID
                and Status = 'CL'
                order by RoundNumber

            open c;
        fetch next from c into @p_rid,@p_rtyp

        while @@FETCH_STATUS = 0
            begin 
                if @p_rtyp = 'FN'
                    exec judging.sp_calculate_skating @p_rid
                else
                    exec judging.sp_advance_from_crosses;

                fetch next from c into @p_rid,@p_rtyp
                end
            close c
            deallocate c

        end
        go


