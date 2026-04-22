using System.ComponentModel.DataAnnotations;

namespace BikeRegister.Application.DTOs
{
    public class FinishProfileSetupDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;
        public string? ProfilePhotoUrl { get; set; }
    }
}
