using BikeRegister.Domain.Registrations;

namespace BikeRegister.Application.DTOs.Registrations
{
    public class UpdateRegistrationDto
    {
        public string? Model { get; set; }
        public string Brand { get; set; }
        public int? ModelYear { get; set; }
        public int FrameSize { get; set; }
        public FrameSizeUnit FrameSizeUnit { get; set; }
        public FrameType FrameType { get; set; }
        public string PrimaryColour { get; set; }
        public string SecondaryColour { get; set; }
        public string City { get; set; }
        public string? District { get; set; }
        public string? Description { get; set; }
    }
}
