namespace DancesportCMS_api.Models
{
    public class CreateTournamentRequest
    {
        public string TournamentName { get; set; } = string.Empty;
        public DateTime TournamentDate { get; set; }
        public string Location { get; set; } = string.Empty;
    }
    public class SetRoundStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}
