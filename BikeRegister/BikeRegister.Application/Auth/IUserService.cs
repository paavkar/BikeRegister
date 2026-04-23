using BikeRegister.Application.DTOs;
using BikeRegister.Application.ResultModels;

namespace BikeRegister.Application.Auth
{
    public interface IUserService
    {
        Task<UserResult> GetUserByIdAsync(string userId);
        Task<UserResult> FinishProfileSetupAsync(FinishProfileSetupDto dto, string userId);
    }
}
