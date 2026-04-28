using Asp.Versioning;
using BikeRegister.Application.DTOs;
using BikeRegister.Application.DTOs.Registrations;
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
                : CreatedAtAction(nameof(AddRegistration), result);
        }

        [HttpGet("my-registrations")]
        public async Task<IActionResult> GetMyRegistrations()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            RegistrationResult result = await registrationService.GetUserRegistrationsAsync(userId);

            return !result.Succeeded
                ? BadRequest(result)
                : Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("user-registrations/{userId}")]
        public async Task<IActionResult> GetUserRegistrations(string userId)
        {
            RegistrationResult result = await registrationService.GetUserRegistrationsAsync(userId);

            return !result.Succeeded
                ? BadRequest(result)
                : Ok(result);
        }

        [HttpGet("stolen")]
        public async Task<IActionResult> GetStolen(SearchFilter filter)
        {
            RegistrationResult result = await registrationService.GetStolenAsync(filter);

            return !result.Succeeded
                ? BadRequest(result)
                : Ok(result);
        }

        [HttpGet("stolen/{userId}")]
        public async Task<IActionResult> GetUserStolen(string userId)
        {
            RegistrationResult result = await registrationService.GetUserStolenAsync(userId);

            return !result.Succeeded
                ? BadRequest(result)
                : Ok(result);
        }

        [HttpGet("registration/{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            RegistrationResult result = await registrationService.GetByIdAsync(id);

            return !result.Succeeded
                ? NotFound(result)
                : Ok(result);
        }
    }
}
