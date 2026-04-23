using System.ComponentModel.DataAnnotations;

namespace BikeRegister.Domain
{
    public class Entity
    {
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        [MaxLength(450)]
        public string CreatedBy { get; set; }
        [MaxLength(450)]
        public string? UpdatedBy { get; set; }
    }
}
