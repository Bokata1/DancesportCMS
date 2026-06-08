namespace DancesportCMS_api.Models
{
    
        public class JudgeClubBiasRow
        {
            public long UserID { get; set; }
            public string JudgeName { get; set; } = string.Empty;
            public string ClubName { get; set; } = string.Empty;
            public int MarkCount { get; set; }
            public int BiasThreshold { get; set; }
            public double AvgZScore { get; set; }
            public double AvgRawDeviation { get; set; }
            public int SignificantCount { get; set; }
            public string BiasDirection { get; set; } = string.Empty;
            public string Severity { get; set; } = string.Empty;
            public string Confidence { get; set; } = string.Empty;
        }

        public class BiasOverview
        {
            public int TotalMarksAnalyzed { get; set; }
            public int JudgesAnalyzed { get; set; }
            public int ClubsAnalyzed { get; set; }
            public int HighBiasSignals { get; set; }
            public int ModerateBiasSignals { get; set; }
            public List<JudgeClubBiasRow> Rows { get; set; } = new();
        }
    
}
