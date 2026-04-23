using BikeRegister.Application.DTOs;
using BikeRegister.Application.Registrations;
using BikeRegister.Application.ResultModels;
using BikeRegister.Domain.Registrations;
using BikeRegister.SharedKernel.Localization;
using Microsoft.Extensions.Localization;

namespace BikeRegister.Infrastructure.Registrations
{
    public class RegistrationService(
        IRegistrationRepository repository,
        IStringLocalizer<AppLocalization> localizer) : IRegistrationService
    {
        public async Task<RegistrationResult> CreateAsync(CreateRegistrationDto registrationDto, string userId)
        {
            Registration registration = registrationDto.FormRegistration(userId);
            var registrationCreated = await repository.AddAsync(registration);

            return registrationCreated
                ? new RegistrationResult { Succeeded = true, Registration = RegistrationDto.FromRegistration(registration) }
                : new RegistrationResult { Succeeded = false, Errors = [localizer["AddRegistrationFailed"]] };
        }
    }
}
