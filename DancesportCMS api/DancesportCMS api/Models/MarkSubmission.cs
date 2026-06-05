namespace DancesportCMS_api.Models
{
    public class MarkSubmissionRequest
    {
        public long RoundID {  get; set; }
        public long DanceID { get; set; }
        public long JudgeUserID { get; set; }
        public string PIN { get; set; } = string.Empty;
        public List<SingleMark> Marks { get; set; } = new();
    }

    public class SingleMark
    {
        public long RegistrationID { get; set; }
        public int MarkValue { get; set; }
    }


}
