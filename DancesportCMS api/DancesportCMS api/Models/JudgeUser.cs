namespace DancesportCMS_api.Models
{
    public class JudgeUser
    {
        public long UserID { get; set; }
        public string FName { get; set; } = string.Empty;
        public string LName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? JudgeLicense { get; set; }
        public bool IsRulesJudge { get; set; }
    }
}
