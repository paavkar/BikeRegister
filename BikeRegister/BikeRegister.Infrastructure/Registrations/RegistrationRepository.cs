using BikeRegister.Application.DTOs;
using BikeRegister.Application.DTOs.Registrations;
using BikeRegister.Application.DTOs.Users;
using BikeRegister.Application.Registrations;
using BikeRegister.Domain.Registrations;
using BikeRegister.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Data;

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

        public async Task<List<RegistrationDto>?> GetByUserIdAsync(string userId)
        {
            try
            {
                List<RegistrationDto> registrations = await context.Registrations
                    .Where(r => r.UserId == userId)
                    .Select(r => RegistrationDto.FromRegistration(r,
                        UserDto.FromUser(r.User)))
                    .ToListAsync();
                return registrations;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occured while fetching user's registrations.");
                return null;
            }
        }

        public async Task<List<RegistrationDto>?> GetAllStolenAsync(SearchFilter filter)
        {
            try
            {
                IQueryable<Registration> query = context.Registrations
                    .Where(r => r.IsStolen);

                var hasFilter = !string.IsNullOrWhiteSpace(filter.Brand) ||
                     !string.IsNullOrWhiteSpace(filter.City) ||
                     !string.IsNullOrWhiteSpace(filter.SerialNumber);

                if (hasFilter)
                {
                    if (!string.IsNullOrWhiteSpace(filter.Brand))
                        query = query.Where(r => r.Brand.Contains(filter.Brand));

                    if (!string.IsNullOrWhiteSpace(filter.City))
                        query = query.Where(r => r.City.Contains(filter.City));

                    if (!string.IsNullOrWhiteSpace(filter.SerialNumber))
                        query = query.Where(r => r.SerialNumber.Contains(filter.SerialNumber));
                }

                List<RegistrationDto> stolen = await query
                    .Select(r => RegistrationDto.FromRegistration(r,
                        UserDto.FromUser(r.User)))
                    .ToListAsync();
                return stolen;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occured while fetching stolen registrations.");
                return null;
            }
        }

        public async Task<List<RegistrationDto>?> GetUserStolenAsync(string userId)
        {
            try
            {
                List<RegistrationDto> userStolen = await context.Registrations
                    .Where(r => r.IsStolen && r.UserId == userId)
                    .Select(r => RegistrationDto.FromRegistration(r,
                        UserDto.FromUser(r.User)))
                    .ToListAsync();

                return userStolen;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occured while fetching user's stolen registrations.");
                return null;
            }
        }

        public async Task<RegistrationDto?> GetByIdAsync(string id)
        {
            try
            {
                RegistrationDto? registration = await context.Registrations
                    .Where(r => r.Id == id)
                    .Select(r => RegistrationDto.FromRegistration(r,
                        UserDto.FromUser(r.User)))
                    .FirstOrDefaultAsync();
                return registration;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while fetching a registration by ID.");
                return null;
            }
        }

        public async Task<bool> UpdateStolenStatusAsync(string id, string userId, bool stolen = false)
        {
            try
            {
                DateTimeOffset dateNow = DateTimeOffset.UtcNow;
                var rowsAffected = await context.Registrations
                    .Where(r => r.Id == id)
                    .ExecuteUpdateAsync(r =>
                    {
                        if (stolen)
                        {
                            r.SetProperty(r => r.IsStolen, true);
                            r.SetProperty(r => r.DateStolen, dateNow);
                        }
                        else
                        {
                            r.SetProperty(r => r.IsStolen, false);
                            r.SetProperty(r => r.DateStolen, (DateTimeOffset?)null);
                        }
                        r.SetProperty(r => r.UpdatedBy, userId);
                        r.SetProperty(r => r.UpdatedAt, dateNow);
                    });
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while updating a registration's stolen status.");
                return false;
            }
        }

        public async Task<bool> UpdateRegistrationAsync(string id, string userId, UpdateRegistrationDto update)
        {
            try
            {
                var rowsAffected = await context.Registrations
                    .Where(r => r.Id == id)
                    .ExecuteUpdateAsync(r =>
                        r.SetProperty(r => r.Model, update.Model)
                         .SetProperty(r => r.Brand, update.Brand)
                         .SetProperty(r => r.ModelYear, update.ModelYear)
                         .SetProperty(r => r.FrameSize, update.FrameSize)
                         .SetProperty(r => r.FrameSizeUnit, update.FrameSizeUnit)
                         .SetProperty(r => r.FrameType, update.FrameType)
                         .SetProperty(r => r.PrimaryColour, update.PrimaryColour)
                         .SetProperty(r => r.SecondaryColour, update.SecondaryColour)
                         .SetProperty(r => r.City, update.City)
                         .SetProperty(r => r.District, update.District)
                         .SetProperty(r => r.Description, update.Description)
                         .SetProperty(r => r.UpdatedBy, userId)
                         .SetProperty(r => r.UpdatedAt, DateTimeOffset.UtcNow));
                return rowsAffected > 0;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occured while updating the registration.");
                return false;
            }
        }
    }
}
