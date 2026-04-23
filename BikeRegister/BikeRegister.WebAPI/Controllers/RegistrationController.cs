using Asp.Versioning;
using BikeRegister.Application.DTOs;
using BikeRegister.Application.Registrations;
using BikeRegister.Application.ResultModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BikeRegister.WebAPI.Controllers
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiVersion("1.0")]
    [Authorize]
    [ApiController]
    public class RegistrationController(
        IRegistrationService registrationService) : ControllerBase
    {
        [HttpPost("add-registration")]
        public async Task<IActionResult> AddRegistration(CreateRegistrationDto createRegistrationDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

            RegistrationResult result = await registrationService.CreateAsync(createRegistrationDto, userId);

            return !result.Succeeded
                ? BadRequest(result)
                : Ok(result);
        }
    }
}
