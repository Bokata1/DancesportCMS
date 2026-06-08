namespace DancesportCMS_api.Models
{
    public class AddRoundRequest
    {
        public  long TournamentID {  get; set; }
        public long CategoryID { get; set; }
        public string RoundType { get; set; } = string.Empty;
        public int? CouplesToAdvance { get; set; }

    }
}
