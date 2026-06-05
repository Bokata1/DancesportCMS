namespace DancesportCMS_api.Models
{
    public class UserSession
    {
        public long UserID { get; set; }
        public string FName { get; set; } = string.Empty;
        public string LName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsAdmin { get; set; }
        public bool IsJudge { get; set; }
        public string? JudgeLicense { get; set; }


    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }


}
