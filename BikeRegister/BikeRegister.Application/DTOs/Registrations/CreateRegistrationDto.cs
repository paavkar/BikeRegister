using BikeRegister.Domain.Registrations;

namespace BikeRegister.Application.DTOs
{
    public class CreateRegistrationDto
    {
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

        public Registration FormRegistration(string userId)
        {
            return new Registration
            {
                Id = Guid.CreateVersion7().ToString(),
                Model = this.Model,
                Brand = this.Brand,
                ModelYear = this.ModelYear,
                FrameSize = this.FrameSize,
                FrameSizeUnit = this.FrameSizeUnit,
                FrameType = this.FrameType,
                PrimaryColour = this.PrimaryColour,
                SecondaryColour = this.SecondaryColour,
                SerialNumber = this.SerialNumber,
                City = this.City,
                District = this.District,
                Description = this.Description,
                IsStolen = this.IsStolen,
                DateStolen = this.DateStolen,
                UserId = userId,
                CreatedBy = userId,
                CreatedAt = DateTimeOffset.UtcNow
            };
        }
    }
}
