using BikeRegister.Application.Images;
using BikeRegister.Domain.Images;
using BikeRegister.Infrastructure.Persistence;
using Microsoft.Extensions.Logging;

namespace BikeRegister.Infrastructure.Images
{
    public class ImageRepository(
        AppDbContext context,
        ILogger<ImageRepository> logger) : IImageRepository
    {
        public async Task<bool> CreateRegistrationImagesAsync(List<Image> images)
        {
            try
            {
                await context.Images.AddRangeAsync(images);
                return await context.SaveChangesAsync() > 0;

            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error occured while adding image information.");
                return false;
            }
        }
    }
}
