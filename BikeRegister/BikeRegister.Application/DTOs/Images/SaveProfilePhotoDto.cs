namespace BikeRegister.Application.DTOs.Images
{
    public class SaveProfilePhotoDto
    {
        public string OriginalFileName { get; set; }
        public Stream StreamContent { get; set; }
    }
}
