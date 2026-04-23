using BikeRegister.Application.Registrations;
using BikeRegister.Domain.Registrations;
using BikeRegister.Infrastructure.Persistence;
using Microsoft.Extensions.Logging;

namespace BikeRegister.Infrastructure.Registrations
{
    public class RegistrationRepository(
        AppDbContext context,
        ILogger<RegistrationRepository> logger) : IRegistrationRepository
    {
        public async Task<bool> AddAsync(Registration registration)
        {
            try
            {
                await context.Registrations.AddAsync(registration);
                return await context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while adding a registration.");
                return false;
            }
        }
    }
}
