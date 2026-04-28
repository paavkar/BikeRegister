using BikeRegister.Application.DTOs;
using BikeRegister.Application.DTOs.Registrations;
using BikeRegister.Application.ResultModels;

namespace BikeRegister.Application.Registrations
{
    public interface IRegistrationService
    {
        // Create
        Task<RegistrationResult> CreateAsync(CreateRegistrationDto registrationDto, string userId);

        // Read
        Task<RegistrationResult> GetUserRegistrationsAsync(string userId);
        Task<RegistrationResult> GetStolenAsync(SearchFilter filter);
        Task<RegistrationResult> GetUserStolenAsync(string userId);
        Task<RegistrationResult> GetByIdAsync(string id);

        // Update
        Task<RegistrationResult> UpdateStolenStatusAsync(string id, string userId, bool stolen = false);
        Task<RegistrationResult> UpdateRegistrationAsync(string id, string userId, UpdateRegistrationDto update);

        // Delete
        Task<RegistrationResult> DeleteAsync(string id, string userId);
        Task<RegistrationResult> DeleteMultipleAsync(List<string> ids, string userId);
    }
}
