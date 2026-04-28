using BikeRegister.Application.DTOs;
using BikeRegister.Application.DTOs.Registrations;
using BikeRegister.Domain.Registrations;

namespace BikeRegister.Application.Registrations
{
    public interface IRegistrationRepository
    {
        Task<bool> AddAsync(Registration registration);
        Task<List<RegistrationDto>?> GetByUserIdAsync(string userId);
        Task<List<RegistrationDto>?> GetAllStolenAsync(SearchFilter filter);
        Task<List<RegistrationDto>?> GetUserStolenAsync(string userId);
        Task<RegistrationDto?> GetByIdAsync(string id);
    }
}
