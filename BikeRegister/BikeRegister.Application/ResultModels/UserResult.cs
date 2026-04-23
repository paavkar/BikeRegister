using BikeRegister.Application.DTOs.Users;

namespace BikeRegister.Application.ResultModels
{
    public class UserResult : BaseResult
    {
        public AppUserDto? User { get; set; }
    }
}
