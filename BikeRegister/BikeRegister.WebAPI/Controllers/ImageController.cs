using Asp.Versioning;
using BikeRegister.Application.DTOs.Images;
using BikeRegister.Application.Images;
using BikeRegister.Application.ResultModels;
using BikeRegister.Domain.Users;
using BikeRegister.SharedKernel.Localization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace BikeRegister.WebAPI.Controllers
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [Authorize]
    [ApiController]
    public class ImageController(
        IImageService imageService,
        IStringLocalizer<AppLocalization> localizer, UserManager<ApplicationUser> manag) : ControllerBase
    {
        [EndpointName("uploadRegistrationImages")]
        [HttpPost("registration/{registrationId}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadRegistrationImages([FromForm] List<IFormFile> images, string registrationId)
        {
            if (images == null || images.Count == 0)
            {
                return BadRequest(new ImageResult
                {
                    Succeeded = false,
                    Errors = [localizer["NoImages"]]
                });
            }

            if (images.Count > 10)
            {
                return BadRequest(new ImageResult
                {
                    Succeeded = false,
                    Errors = [localizer["Max10Images"]]
                });
            }

            List<SaveImageDto> imagesList = [];

            foreach (IFormFile file in images)
            {
                MemoryStream memoryStream = new();
                await file.CopyToAsync(memoryStream);
                memoryStream.Position = 0;

                imagesList.Add(new SaveImageDto
                {
                    Id = Guid.CreateVersion7().ToString(),
                    RegistrationId = registrationId,
                    ContentType = file.ContentType,
                    FileSize = file.Length,
                    OriginalFileName = file.FileName,
                    UploadedAt = DateTimeOffset.UtcNow,
                    StreamContent = memoryStream
                });
            }

            ImageResult result = await imageService.UploadRegistrationImagesAsync(registrationId, imagesList);

            return !result.Succeeded
                ? BadRequest(result)
                : Ok(result);
        }

        [EndpointName("uploadProfilePhoto")]
        [HttpPost("profile/{userId}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadProfilePhoto([FromForm] List<IFormFile> images, string userId)
        {
            if (images == null || images.Count == 0)
            {
                return BadRequest(new ImageResult
                {
                    Succeeded = false,
                    Errors = [localizer["NoImages"]]
                });
            }

            if (images.Count > 1)
            {
                return BadRequest(new ImageResult
                {
                    Succeeded = false,
                    Errors = [localizer["Max1Image"]]
                });
            }

            List<SaveProfilePhotoDto> imagesList = [];
            foreach (IFormFile image in images)
            {
                MemoryStream memoryStream = new();
                await image.CopyToAsync(memoryStream);
                memoryStream.Position = 0;

                imagesList.Add(new SaveProfilePhotoDto
                {
                    OriginalFileName = image.FileName,
                    StreamContent = memoryStream
                });
            }

            ImageResult result = await imageService.UploadProfilePhotoAsync(userId, imagesList[0]);

            return !result.Succeeded
                ? BadRequest(result)
                : Ok(result);
        }
    }
}
