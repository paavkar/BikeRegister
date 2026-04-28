using BikeRegister.Application.DTOs;

namespace BikeRegister.Application.ResultModels
{
    public class RegistrationResult : BaseResult
    {
        public RegistrationDto? Registration { get; set; }
        public List<RegistrationDto>? Registrations { get; set; }
    }
}
