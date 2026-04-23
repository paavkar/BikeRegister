using Asp.Versioning;
using BikeRegister.Application.Auth;
using BikeRegister.Application.DTOs;
using BikeRegister.Application.ResultModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BikeRegister.WebAPI.Controllers
{
    [Authorize]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [ApiController]
    public class UserController(
        IUserService userService) : ControllerBase
    {
        [HttpGet("get-authenticated")]
        public async Task<IActionResult> GetUserInfo()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            UserResult result = await userService.GetUserByIdAsync(userId);

            return !result.Succeeded
                ? BadRequest(result)
                : Ok(result);
        }

        [HttpPost("finish-profile-setup")]
        public async Task<IActionResult> FinishProfileSetup(FinishProfileSetupDto finishDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            UserResult result = await userService.FinishProfileSetupAsync(finishDto, userId);

            return !result.Succeeded
                ? BadRequest(result)
                : Ok(result);
        }
    }
}
