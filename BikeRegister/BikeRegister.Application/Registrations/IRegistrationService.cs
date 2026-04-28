using BikeRegister.Application.DTOs;
using BikeRegister.Application.DTOs.Registrations;
using BikeRegister.Application.ResultModels;

namespace BikeRegister.Application.Registrations
{
    public interface IRegistrationService
    {
        Task<RegistrationResult> CreateAsync(CreateRegistrationDto registrationDto, string userId);

        Task<RegistrationResult> GetUserRegistrationsAsync(string userId);
        Task<RegistrationResult> GetStolenAsync(SearchFilter filter);
        Task<RegistrationResult> GetUserStolenAsync(string userId);
        Task<RegistrationResult> GetByIdAsync(string id);
    }
}
