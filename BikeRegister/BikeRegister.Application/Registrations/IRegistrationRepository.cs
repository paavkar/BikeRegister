using BikeRegister.Application.DTOs;
using BikeRegister.Application.DTOs.Registrations;
using BikeRegister.Domain.Registrations;

namespace BikeRegister.Application.Registrations
{
    public interface IRegistrationRepository
    {
        // Create
        Task<bool> AddAsync(Registration registration);

        //Read
        Task<List<RegistrationDto>?> GetByUserIdAsync(string userId);
        Task<List<RegistrationDto>?> GetAllStolenAsync(SearchFilter filter);
        Task<List<RegistrationDto>?> GetUserStolenAsync(string userId);
        Task<RegistrationDto?> GetByIdAsync(string id);

        // Update
        Task<bool> UpdateStolenStatusAsync(string id, string userId, bool stolen = false);
        Task<bool> UpdateRegistrationAsync(string id, string userId, UpdateRegistrationDto update);
    }
}
