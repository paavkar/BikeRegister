using BikeRegister.Application.DTOs;
using BikeRegister.Application.ResultModels;

namespace BikeRegister.Application.Registrations
{
    public interface IRegistrationService
    {
        Task<RegistrationResult> CreateAsync(CreateRegistrationDto registrationDto, string userId);
    }
}
