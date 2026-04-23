using BikeRegister.Application.Auth;
using BikeRegister.Application.DTOs;
using BikeRegister.Application.DTOs.Users;
using BikeRegister.Application.ResultModels;
using BikeRegister.Domain.Users;
using BikeRegister.SharedKernel.Localization;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Localization;

namespace BikeRegister.Infrastructure.Users
{
    public class UserService(
        UserManager<ApplicationUser> userManager,
        IStringLocalizer<AppLocalization> localizer) : IUserService
    {
        public async Task<UserResult> GetUserByIdAsync(string userId)
        {
            ApplicationUser? user = await userManager.FindByIdAsync(userId);

            if (user is null)
            {
                return new UserResult
                {
                    Succeeded = false,
                    Errors = [localizer["UserNotFound"]]
                };
            }

            // TODO: Fetch user registrations and map to RegistrationDto

            AppUserDto userDto = AppUserDto.FromApplicationUser(user, []);

            return new UserResult
            {
                Succeeded = true,
                User = userDto
            };
        }

        public async Task<UserResult> FinishProfileSetupAsync(FinishProfileSetupDto dto, string userId)
        {
            ApplicationUser? user = await userManager.FindByIdAsync(userId);

            if (user is null)
            {
                return new UserResult
                {
                    Succeeded = false,
                    Errors = [localizer["UserNotFound"]]
                };
            }

            user.Name = dto.Name;
            user.PhoneNumber = dto.PhoneNumber;
            user.ProfilePhotoUrl = dto.ProfilePhotoUrl;

            IdentityResult result = await userManager.UpdateAsync(user);

            return !result.Succeeded
                ? new UserResult
                {
                    Succeeded = false,
                    Errors = result.Errors.Select(e => localizer[e.Code].ToString())
                }
                : new UserResult
                {
                    Succeeded = true
                };
        }
    }
}
