namespace DancesportCMS_api.Models
{
    public class RoundCouple
    {
        public long RegistrationID { get; set; }
        public int StartNumber { get; set; }


    }
    public class RoundDance 
        {
        public long DanceID {  get; set; }
        public string DanceName { get; set; } = string.Empty;
        public int DanceOrder {  get; set; }

        }

    public class  RoundForJudging
    {
        public long RoundID { get; set; }
        public string TournamentName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string RoundType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int? CouplesToAdvance { get; set; }
        public List<RoundCouple> Couples { get; set; } = new();
        public List<RoundDance> Dances { get; set; } = new();
    }

}
