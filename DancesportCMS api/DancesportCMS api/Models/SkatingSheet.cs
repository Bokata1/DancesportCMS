namespace DancesportCMS_api.Models
{
    public class SkatingSheet
    {
        public long RoundID { get; set; }
        public string TournamentName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string RoundType { get; set; } = string.Empty;

        public List<DanceSheet> Dances { get; set; } = new();
        public List<FinalResultRow> FinalResults { get; set; } = new();


    }
    public class DanceSheet
    {
        public long DanceID { get; set; }
        public string DanceName { get; set; } = string.Empty;
        public List<JudgeColumn> Judges { get; set; } = new();
        public List<CoupleDanceRow> Couples { get; set; } = new();

    }
    public class JudgeColumn
    {
        public long UserID { get; set; }
        public string DisplayCode { get; set; } = string.Empty;

    }
    public class CoupleDanceRow
    {
        public long RegistrationID { get; set; }
        public long StartNumber { get; set; }
        public List<int> Marks { get; set; } = new();
        public decimal Sum { get; set; }
        public decimal DancePlacement { get; set; }
    }



    public class FinalResultRow
    {
        public long RegistrationID { get; set; }
        public long StartNumber{ get; set; }
        public string PartnerNames { get; set; } = string.Empty;
        public decimal TotalSum { get; set; }
        public decimal FinalPlace { get; set; }


    }

}
