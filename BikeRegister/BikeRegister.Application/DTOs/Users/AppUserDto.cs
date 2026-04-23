using BikeRegister.Domain.Users;

namespace BikeRegister.Application.DTOs.Users
{
    public class AppUserDto
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string? PhoneNumber { get; set; }
        public bool EmailConfirmed { get; set; }
        public bool TwoFactorEnabled { get; set; }
        public string Name { get; set; }
        public string? ProfilePhotoUrl { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }

        public IEnumerable<RegistrationDto> Registrations { get; set; } = [];

        public static AppUserDto FromApplicationUser(ApplicationUser user, IEnumerable<RegistrationDto> registrations)
        {
            return new AppUserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                EmailConfirmed = user.EmailConfirmed,
                TwoFactorEnabled = user.TwoFactorEnabled,
                Name = user.Name,
                ProfilePhotoUrl = user.ProfilePhotoUrl,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                Registrations = registrations
            };
        }
    }
}
