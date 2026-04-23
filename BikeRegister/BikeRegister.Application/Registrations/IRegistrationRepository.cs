using BikeRegister.Domain.Registrations;

namespace BikeRegister.Application.Registrations
{
    public interface IRegistrationRepository
    {
        Task<bool> AddAsync(Registration registration);
    }
}
