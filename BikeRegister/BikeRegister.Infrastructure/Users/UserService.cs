using BikeRegister.Application.Auth;
using BikeRegister.Application.DTOs;
using BikeRegister.Application.DTOs.Users;
using BikeRegister.Application.Registrations;
using BikeRegister.Application.ResultModels;
using BikeRegister.Domain.Users;
using BikeRegister.SharedKernel.Localization;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Localization;

namespace BikeRegister.Infrastructure.Users
{
    public class UserService(
        UserManager<ApplicationUser> userManager,
        IStringLocalizer<AppLocalization> localizer,
        IRegistrationRepository registrationRepository) : IUserService
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
            List<RegistrationDto>? registrations = await registrationRepository.GetByUserIdAsync(userId);

            AppUserDto userDto = AppUserDto.FromApplicationUser(user, registrations);

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
