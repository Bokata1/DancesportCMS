namespace DancesportCMS_api.Models
{
    public class Tournament
    {
        public long TournamentID { get; set; }
        public string TournamentName { get; set; } = string.Empty;
        public DateTime TournamentDate { get; set; }
        public string Location { get; set; } = string.Empty;
        public bool IsRegistrationOpen { get; set; }
        public bool IsFinished { get; set; }
    }
    public class TournamentResultsView
    {
        public long TournamentID { get; set; }
        public string TournamentName { get; set; } = string.Empty;
        public DateTime TournamentDate { get; set; }
        public string Location { get; set; } = string.Empty;
        public List<CategoryResultGroup> Categories { get; set; } = new();
    }

    public class CategoryResultGroup
    {
        public long CategoryID { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public long FinalRoundID { get; set; }
        public List<FinalPlacement> Placements { get; set; } = new();
        public List<RoundLink> Rounds { get; set; } = new();
    }

    public class FinalPlacement
    {
        public int FinalPlace { get; set; }
        public int StartNumber { get; set; }
        public string CoupleName { get; set; } = string.Empty;
        public string ClubName { get; set; } = string.Empty;
    }

    public class RoundLink
    {
        public long RoundID { get; set; }
        public string RoundType { get; set; } = string.Empty;
    }
}
