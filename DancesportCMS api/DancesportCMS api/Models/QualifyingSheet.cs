namespace DancesportCMS_api.Models
{
    public class QualifyingSheet
    {
        public long RoundID { get; set; }
        public string TournamentName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string RoundType { get; set; } = string.Empty;
        public int? CouplesToAdvance { get; set; }
        public List<QualifyingDance> Dances { get; set; } = new();
        public List<QualifyingCoupleRow> Couples { get; set; } = new();
    }
    public class QualifyingDance
    {
        public long DanceID { get; set; }
        public string DanceName { get; set; } = string.Empty;
    }

    public class QualifyingCoupleRow
    {
        public long RegistrationID { get; set; }
        public int StartNumber { get; set; }
        public int TotalCrosses { get; set; }
        public bool Advanced { get; set; }
        public List<DanceCrossInfo> DanceCrosses { get; set; } = new();
    }

    public class DanceCrossInfo
    {
        public long DanceID { get; set; }
        public int CrossCount { get; set; }
    }
}
