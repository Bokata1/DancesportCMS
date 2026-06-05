namespace DancesportCMS_api.Models
{
    public class JudgeSession
    {
        public long UserID { get; set; }
        public string FName { get; set; } = string.Empty;
        public string LName { get; set; } = string.Empty;
        public string? JudgeLicense { get; set; }
        public bool IsRulesJudge { get; set; }

        public List<ActiveRoundForJudge> ActiveRounds { get; set; } = new();
    }


        public class ActiveRoundForJudge
        {
            public long RoundID { get; set; }
            public long TournamentID { get; set; }
            public string TournamentName { get; set; } = string.Empty;
            public string CategoryName { get; set; } = string.Empty;
            public string RoundType { get; set; } = string.Empty;
        }

        public class JudgeAuthRequest
        {
        public string PIN { get; set; } = string.Empty;
        }

    
}
