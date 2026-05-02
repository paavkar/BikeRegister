using BikeRegister.Application.Auth;
using BikeRegister.Application.Images;
using BikeRegister.Application.Registrations;
using BikeRegister.Infrastructure.Auth;
using BikeRegister.Infrastructure.Images;
using BikeRegister.Infrastructure.Persistence;
using BikeRegister.Infrastructure.Registrations;
using BikeRegister.Infrastructure.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BikeRegister.Infrastructure
{
    public static class InfrastructureServiceRegistration
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddHybridCache(options =>
            {
                options.DefaultEntryOptions = new()
                {
                    Expiration = TimeSpan.FromMinutes(30),
                    LocalCacheExpiration = TimeSpan.FromMinutes(30)
                };
            });

            var connectionString = configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(connectionString));

            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IRegistrationRepository, RegistrationRepository>();
            services.AddScoped<IRegistrationService, RegistrationService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IImageRepository, ImageRepository>();
            services.AddScoped<IImageService, ImageService>();

            return services;
        }
    }
}
