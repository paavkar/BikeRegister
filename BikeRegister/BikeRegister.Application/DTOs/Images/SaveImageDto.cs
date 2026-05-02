using BikeRegister.Domain.Images;

namespace BikeRegister.Application.DTOs.Images
{
    public class SaveImageDto
    {
        public string Id { get; set; }
        public string RegistrationId { get; set; }
        public string ContentType { get; set; }
        public long FileSize { get; set; }
        public string OriginalFileName { get; set; }
        public DateTimeOffset UploadedAt { get; set; }
        public Stream StreamContent { get; set; }

        public static Image ToFullImage(SaveImageDto dto, string blobName, string imageUrl)
        {
            return new Image
            {
                Id = dto.Id,
                BlobName = blobName,
                ImageUrl = imageUrl,
                RegistrationId = dto.RegistrationId,
                ContentType = dto.ContentType,
                FileSize = dto.FileSize,
                OriginalFileName = dto.OriginalFileName,
                UploadedAt = dto.UploadedAt
            };
        }
    }
}
