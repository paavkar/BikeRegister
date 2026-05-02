using BikeRegister.Application.DTOs;
using BikeRegister.Application.DTOs.Registrations;
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
                ? new RegistrationResult
                {
                    Succeeded = true,
                    Registration = RegistrationDto.FromRegistration(registration, [])
                }
                : new RegistrationResult { Succeeded = false, Errors = [localizer["AddRegistrationFailed"]] };
        }

        public async Task<RegistrationResult> GetUserRegistrationsAsync(string userId)
        {
            List<RegistrationDto>? registrations = await repository.GetByUserIdAsync(userId);

            return registrations is null
                ? new RegistrationResult { Succeeded = false, Errors = [localizer["UserRegistrationsNotFound"]] }
                : new RegistrationResult
                {
                    Succeeded = true,
                    Registrations = registrations
                };
        }

        public async Task<RegistrationResult> GetStolenAsync(SearchFilter filter)
        {
            List<RegistrationDto>? stolen = await repository.GetAllStolenAsync(filter);

            return stolen is null
                ? new RegistrationResult { Succeeded = false, Errors = [localizer["StolenRegistrationsNotFound"]] }
                : new RegistrationResult
                {
                    Succeeded = true,
                    Registrations = stolen
                };
        }

        public async Task<RegistrationResult> GetUserStolenAsync(string userId)
        {
            List<RegistrationDto>? stolen = await repository.GetUserStolenAsync(userId);

            return stolen is null
                ? new RegistrationResult { Succeeded = false, Errors = [localizer["StolenRegistrationsNotFound"]] }
                : new RegistrationResult
                {
                    Succeeded = true,
                    Registrations = stolen
                };
        }

        public async Task<RegistrationResult> GetByIdAsync(string id)
        {
            RegistrationDto? registration = await repository.GetByIdAsync(id);

            return registration is null
                ? new RegistrationResult { Succeeded = false, Errors = [localizer["RegistrationNotFound"]] }
                : new RegistrationResult
                {
                    Succeeded = true,
                    Registration = registration
                };
        }

        public async Task<RegistrationResult> UpdateStolenStatusAsync(string id, string userId, bool stolen = false)
        {
            var updated = await repository.UpdateStolenStatusAsync(id, userId, stolen);

            return updated
                ? new RegistrationResult { Succeeded = true }
                : new RegistrationResult { Succeeded = false, Errors = [localizer["UpdateStolenStatusFailed"]] };
        }

        public async Task<RegistrationResult> UpdateRegistrationAsync(string id, string userId, UpdateRegistrationDto update)
        {
            var updated = await repository.UpdateRegistrationAsync(id, userId, update);

            return updated
                ? new RegistrationResult { Succeeded = true }
                : new RegistrationResult { Succeeded = false, Errors = [localizer["UpdateRegistrationFailed"]] };
        }

        public async Task<RegistrationResult> DeleteAsync(string id, string userId)
        {
            var deleted = await repository.DeleteAsync(id, userId);
            return deleted
                ? new RegistrationResult { Succeeded = true }
                : new RegistrationResult { Succeeded = false, Errors = [localizer["DeleteRegistrationFailed"]] };
        }

        public async Task<RegistrationResult> DeleteMultipleAsync(List<string> ids, string userId)
        {
            var deleted = await repository.DeleteMultipleAsync(ids, userId);
            return deleted
                ? new RegistrationResult { Succeeded = true }
                : new RegistrationResult { Succeeded = false, Errors = [localizer["DeleteMultipleRegistrationsFailed"]] };
        }
    }
}
