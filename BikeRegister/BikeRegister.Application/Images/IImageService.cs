using BikeRegister.Application.DTOs.Images;
using BikeRegister.Application.ResultModels;

namespace BikeRegister.Application.Images
{
    public interface IImageService
    {
        Task<ImageResult> UploadRegistrationImagesAsync(string registrationId, List<SaveImageDto> iamges);
        Task<ImageResult> UploadProfilePhotoAsync(string userId, SaveProfilePhotoDto image);
    }
}
