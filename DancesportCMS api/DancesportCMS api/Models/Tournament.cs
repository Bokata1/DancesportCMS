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
}
