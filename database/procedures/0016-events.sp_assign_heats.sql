 USE [DancesportCMS]
GO

create or alter procedure [events].[sp_assign_heats]
    @p_TournamentID bigint
as
begin
    set nocount on

    declare @p_rid bigint,
            @p_couples int,
            @p_heats int

    declare c cursor local fast_forward for
        select RoundID
        from events.Rounds
        where TournamentID = @p_TournamentID
          and RoundType = 'QL'
          and Status = 'PN'

    open c
    fetch next from c into @p_rid

    while @@FETCH_STATUS = 0
    begin
        select @p_couples = count(*)
        from events.Rounds r
        join events.TournamentsRegistration tr
               on tr.TournamentID = r.TournamentID
              and tr.CategoryID = r.CategoryID
        where r.RoundID = @p_rid

        if @p_couples < 9
            set @p_heats = 1
        else
        begin
            set @p_heats = @p_couples / 8
            if @p_couples % 8 <> 0
                set @p_heats = @p_heats + 1

            while @p_heats > 1
                  and (@p_couples / @p_heats) < 5
                set @p_heats = @p_heats - 1
        end

        delete from events.HeatsEnties
        where HeatID in (select HeatID from events.Heats where RoundId = @p_rid)

        delete from events.Heats where RoundId = @p_rid

        declare @heatIDs table (HeatNumber int, HeatID bigint)

        declare @i int = 1
        while @i <= @p_heats
        begin
            insert into events.Heats (RoundId, HeatNumber, Status)
            values (@p_rid, @i, 'PN')

            insert into @heatIDs (HeatNumber, HeatID)
            values (@i, scope_identity())

            set @i = @i + 1
        end

        ;with shuffle as (
            select tr.RegistrationID,
                   row_number() over (order by newid()) as rn
            from events.Rounds r
            join events.TournamentsRegistration tr
                   on tr.TournamentID = r.TournamentID
                  and tr.CategoryID = r.CategoryID
            where r.RoundID = @p_rid
        )
        insert into events.HeatsEnties(HeatID,RegistrationID)
        select h.HeatID, s.RegistrationID
        from shuffle s
        join @heatIDs h
              on h.HeatNumber = ((s.rn - 1) % @p_heats) + 1

        delete from @heatIDs

        fetch next from c into @p_rid
    end

    close c
    deallocate c
end
GO