namespace DancesportCMS_api.Models
{
    public class Category
    {
        public long CategoryID { get; set; }
        public string AgeGroup { get; set; } = string.Empty;
        public string? Class { get; set; }
        public string DanceStyle { get; set; } = string.Empty;

    }
}
