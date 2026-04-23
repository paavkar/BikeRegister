using BikeRegister.Domain.Users;

namespace BikeRegister.Application.DTOs.Users
{
    public class UserDto
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
        public string PhoneNumber { get; set; }
        public string Name { get; set; }
        public string? ProfilePhotoUrl { get; set; }

        public UserDto FromUser(ApplicationUser user)
        {
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                UserName = user.UserName,
                PhoneNumber = user.PhoneNumber,
                Name = user.Name,
                ProfilePhotoUrl = user.ProfilePhotoUrl
            };
        }
    }
}
