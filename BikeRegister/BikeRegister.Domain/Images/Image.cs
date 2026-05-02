using BikeRegister.Domain.Registrations;

namespace BikeRegister.Domain.Images
{
    public class Image
    {
        public string Id { get; set; }
        public string BlobName { get; set; }
        public string ImageUrl { get; set; }
        public string RegistrationId { get; set; }
        public string ContentType { get; set; }
        public long FileSize { get; set; }
        public string OriginalFileName { get; set; }
        public DateTimeOffset UploadedAt { get; set; }

        public Registration? Registration { get; set; }
    }
}
