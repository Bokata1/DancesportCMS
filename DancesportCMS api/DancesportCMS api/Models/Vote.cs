using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DancesportCMS_api.Models
{
    public class PublicVote
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public long TournamentID { get; set; }
        public long CategoryID { get; set; }
        public long RegistrationID { get; set; }
        public string VoterFingerprint { get; set; } = string.Empty;
        public DateTime VotedAt { get; set; }
    }
    public class CastVoteRequest
    {
        public long TournamentID { get; set; }
        public long CategoryID { get; set; }
        public long RegistrationID { get; set; }
        public string VoterFingerprint { get; set; } = string.Empty;
    }
    public class VoteResult
    {
        public long RegistrationID { get; set; }
        public int StartNumber { get; set; }
        public string CoupleName { get; set; } = string.Empty;
        public string ClubName { get; set; } = string.Empty;
        public int VoteCount { get; set; }
        public double Percentage { get; set; }
    }

    public class VoteResultsOverview
    {
        public string TournamentName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public int TotalVotes { get; set; }
        public List<VoteResult> Results { get; set; } = new();
    }
    public class VotableCouple
    {
        public long RegistrationID { get; set; }
        public int StartNumber { get; set; }
        public string CoupleName { get; set; } = string.Empty;
        public string ClubName { get; set; } = string.Empty;
    }
    public class RulesViolation
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public long TournamentID { get; set; }
        public long RoundID { get; set; }
        public long CategoryID { get; set; }
        public long RegistrationID { get; set; }
        public string FlagType { get; set; } = string.Empty;  
        public long? DanceID { get; set; }  
        public long FlaggedBy { get; set; }
        public DateTime FlaggedAt { get; set; }
    }

    public class ToggleViolationRequest
    {
        public long TournamentID { get; set; }
        public long RoundID { get; set; }
        public long CategoryID { get; set; }
        public long RegistrationID { get; set; }
        public string FlagType { get; set; } = string.Empty;
        public long? DanceID { get; set; }
        public long FlaggedBy { get; set; }
    }

    public class RulesViolationSummary
    {
        public long RegistrationID { get; set; }
        public int StartNumber { get; set; }
        public string CoupleName { get; set; } = string.Empty;
        public string ClubName { get; set; } = string.Empty;
        public bool HasCostumeFlag { get; set; }
        public List<long> ChoreographyDanceIDs { get; set; } = new();
    }

    public class RulesRoundView
    {
        public long RoundID { get; set; }
        public long TournamentID { get; set; }
        public long CategoryID { get; set; }
        public string TournamentName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public List<DanceInfo> Dances { get; set; } = new();
        public List<RulesViolationSummary> Couples { get; set; } = new();
    }
    public class TournamentViolationsView
    {
        public long TournamentID { get; set; }
        public string TournamentName { get; set; } = string.Empty;
        public int TotalViolations { get; set; }
        public List<CategoryViolationsGroup> Categories { get; set; } = new();
    }

    public class CategoryViolationsGroup
    {
        public long CategoryID { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public long RoundID { get; set; }
        public string RoundType { get; set; } = string.Empty;
        public List<CoupleViolationDetail> Couples { get; set; } = new();
    }

    public class CoupleViolationDetail
    {
        public long RegistrationID { get; set; }
        public int StartNumber { get; set; }
        public string CoupleName { get; set; } = string.Empty;
        public string ClubName { get; set; } = string.Empty;
        public bool HasCostumeFlag { get; set; }
        public List<DanceFlagInfo> ChoreographyFlags { get; set; } = new();
    }

    public class DanceFlagInfo
    {
        public long DanceID { get; set; }
        public string DanceName { get; set; } = string.Empty;
    }
}
