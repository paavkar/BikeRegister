using BikeRegister.Application.DTOs.Users;
using BikeRegister.Domain.Registrations;

namespace BikeRegister.Application.DTOs
{
    public class RegistrationDto
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

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }

        public UserDto? User { get; set; }

        public static RegistrationDto FromRegistration(Registration registration, UserDto user)
        {
            return new RegistrationDto
            {
                Id = registration.Id,
                Model = registration.Model,
                Brand = registration.Brand,
                ModelYear = registration.ModelYear,
                FrameSize = registration.FrameSize,
                FrameSizeUnit = registration.FrameSizeUnit,
                FrameType = registration.FrameType,
                PrimaryColour = registration.PrimaryColour,
                SecondaryColour = registration.SecondaryColour,
                SerialNumber = registration.SerialNumber,
                City = registration.City,
                District = registration.District,
                Description = registration.Description,
                IsStolen = registration.IsStolen,
                DateStolen = registration.DateStolen,
                CreatedAt = registration.CreatedAt,
                UpdatedAt = registration.UpdatedAt,
                User = user
            };
        }
    }
}
