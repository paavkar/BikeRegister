using BikeRegister.Application.DTOs.Images;
using BikeRegister.Application.ResultModels;

namespace BikeRegister.Application.Images
{
    public interface IImageService
    {
        Task<ImageResult> UploadRegistrationImages(string registrationId, List<SaveImageDto> iamges);
    }
}
