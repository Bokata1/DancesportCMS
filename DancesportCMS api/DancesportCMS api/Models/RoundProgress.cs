namespace DancesportCMS_api.Models
{
    public class RoundProgress
    {
        public long RoundID { get; set; }
        public long TournamentID { get; set; }
        public string TournamentName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string RoundType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int TotalDances { get; set; }
        public int TotalJudges { get; set; }
        public int TotalCouples { get; set; }
        public int TotalMarksExpected { get; set; }
        public int TotalMarksReceived { get; set; }
        public List<JudgeProgress> Judges { get; set; } = new();
        public List<DanceInfo> Dances { get; set; } = new();
    }

    public class JudgeProgress
    {
        public long UserID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string JudgeLicense { get; set; } = string.Empty;
        public bool IsRulesJudge { get; set; }
        public List<DanceStatus> DanceStatuses { get; set; } = new();
    }

    public class DanceStatus
    {
        public long DanceID { get; set; }
        public string DanceName { get; set; } = string.Empty;
        public bool IsSubmitted { get; set; }
    }

    public class DanceInfo
    {
        public long DanceID { get; set; }
        public string DanceName { get; set; } = string.Empty;
    }
}

