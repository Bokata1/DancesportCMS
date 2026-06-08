namespace DancesportCMS_api.Models
{
    public class CoupleRegistrationRequest
    {
        public long TournamentID { get; set; }
        public List<long> CategoryIDs { get; set; } = new();
        public string Partner1Name { get; set; } = string.Empty;
        public string Partner2Name { get; set; } = string.Empty;
        public string ClubName { get; set; } = string.Empty;


    }
}
