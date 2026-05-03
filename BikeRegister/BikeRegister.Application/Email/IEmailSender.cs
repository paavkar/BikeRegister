using BikeRegister.Application.ResultModels;
using BikeRegister.Domain.Users;

namespace BikeRegister.Application.Email
{
    public interface IEmailSender
    {
        Task<EmailResult> SendConfirmationLinkAsync(ApplicationUser user, string email, string confirmationLink);
    }
}
