using BikeRegister.Domain.Users;

namespace BikeRegister.Domain.Registrations
{
    public class Registration : Entity
    {
        public string Id { get; set; }
        public string? Model { get; set; }
        public string Brand { get; set; }
        public int? ModelYear { get; set; }
        public int FrameSize { get; set; }
        public FrameSizeUnit FrameSizeUnit { get; set; }
        public FrameType FrameType { get; set; }
        public string PrimaryColour { get; set; }
        public string SecondaryColour { get; set; }
        public string SerialNumber { get; set; }
        public string City { get; set; }
        public string? District { get; set; }
        public string? Description { get; set; }
        public bool IsStolen { get; set; }
        public DateTimeOffset? DateStolen { get; set; }

        public string UserId { get; set; }
        public ApplicationUser User { get; set; }
    }

    public enum FrameSizeUnit
    {
        Centimeters = 0,
        Inches
    }

    public enum FrameType
    {
        Unknown = 0,
        Road,
        MTB,
        Hybrid,
        EBike
    }
}
