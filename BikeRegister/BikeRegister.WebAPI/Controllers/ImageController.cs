using Asp.Versioning;
using BikeRegister.Application.DTOs.Images;
using BikeRegister.Application.Images;
using BikeRegister.Application.ResultModels;
using BikeRegister.SharedKernel.Localization;
using Microsoft.AspNetCore.Authorization;
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
        IStringLocalizer<AppLocalization> localizer) : ControllerBase
    {
        [EndpointName("uploadRegistrationImages")]
        [HttpPost("upload/{registrationId}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadRegistrationImages([FromForm] List<IFormFile> images, string registrationId)
        {
            if (images == null || images.Count == 0) return BadRequest("NoImages");
            if (images.Count > 10) return BadRequest("Max10Images");
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

            ImageResult result = await imageService.UploadRegistrationImages(registrationId, imagesList);

            return !result.Succeeded
                ? BadRequest(result)
                : Ok(result);
        }
    }
}
