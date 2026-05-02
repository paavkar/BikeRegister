using BikeRegister.Domain.Images;

namespace BikeRegister.Application.Images
{
    public interface IImageRepository
    {
        Task<bool> CreateRegistrationImagesAsync(List<Image> images);
    }
}
