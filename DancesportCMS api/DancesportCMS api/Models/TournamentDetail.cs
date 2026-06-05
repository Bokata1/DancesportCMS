namespace DancesportCMS_api.Models
{
    public class TournamentDetail
    {
        public long TournamentID { get; set; }
        public string TournamentName { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public bool IsRegistrationOpen { get; set; }
        public bool IsFinished { get; set; }

        public List<RoundSummary> Rounds { get; set; } = new();
        public List<JudgeUser> Judges { get; set; } = new();
    


    }
     public class RoundSummary
    {
        public long RoundID { get; set; }
        public long CategoryID {  get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string RoundType { get; set; } = string.Empty;
        public int RoundNumber { get; set; }
        public string Status { get; set; } = string.Empty;
        public int CoupleCount { get; set; }
    }


}
