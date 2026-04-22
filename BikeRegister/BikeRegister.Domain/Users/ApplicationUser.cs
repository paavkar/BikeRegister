using Microsoft.AspNetCore.Identity;

namespace BikeRegister.Domain.Users
{
    public class ApplicationUser : IdentityUser
    {
        [ProtectedPersonalData]
        public string Name { get; set; }
        public string? ProfilePhotoUrl { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? UpdatedAt { get; set; }
    }
}
