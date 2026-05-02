namespace BikeRegister.Application.DTOs.Images
{
    public class ImageDto
    {
        public string Id { get; set; }
        public string ImageUrl { get; set; }
        public string OriginalFileName { get; set; }
        public DateTimeOffset UploadedAt { get; set; }
    }
}
