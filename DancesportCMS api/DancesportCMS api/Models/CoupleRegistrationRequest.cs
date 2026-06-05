namespace DancesportCMS_api.Models
{
    public class CoupleRegistrationRequest
    {
        public long TournamentID {get; set;}
        public long CategoryID { get; set; }
        public string Partner1Name { get; set; } = string.Empty;
        public string Partner2Name { get; set; } = string.Empty;
        public string ClubName { get; set; } = string.Empty;



    }
}
