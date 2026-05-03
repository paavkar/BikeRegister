using BikeRegister.Application.Email;
using BikeRegister.Application.ResultModels;
using BikeRegister.Domain.Users;
using BikeRegister.SharedKernel.Localization;
using FluentEmail.Core;
using FluentEmail.Core.Models;
using FluentEmail.Razor;
using FluentEmail.Smtp;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Localization;
using System.Net;
using System.Net.Mail;
using System.Text;

namespace BikeRegister.Infrastructure.EmailSender
{
    public class FluentEmailSender(
        IConfiguration configuration,
        IStringLocalizer<AppLocalization> localizer) : IEmailSender
    {
        private readonly string ApiKey = configuration["EmailSender:ApiKey"]
            ?? throw new Exception("No sender ApiKey found.");
        private readonly string EmailAddress = configuration["EmailSender:EmailAddress"]
            ?? throw new Exception("No sender EmailAddress found.");

        public async Task<EmailResult> SendConfirmationLinkAsync(
            ApplicationUser user, string email, string confirmationLink)
        {
            SmtpSender sender = new(() => new SmtpClient("smtp.resend.com", 587)
            {
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential("resend", ApiKey),
                EnableSsl = true
            });

            Email.DefaultSender = sender;
            Email.DefaultRenderer = new RazorRenderer();
            StringBuilder template = new();
            template.AppendLine("Hey @Model.Email,");
            template.AppendLine("<p>Please confirm your account by <a href='@Model.ConfirmationLink'>clicking here</a>.</p>");
            template.AppendLine("- Developer of BikeRegister");
            template.AppendLine("<p>You can ignore this email if this was not you</p>");

            SendResponse response = await Email
                .From(EmailAddress)
                .To(email)
                .Subject("Confirm your email")
                .UsingTemplate(template.ToString(), new { Email = email, ConfirmationLink = confirmationLink })
                .SendAsync();

            return !response.Successful
                ? new EmailResult
                {
                    Succeeded = false,
                    Errors = [localizer["EmailSendFail"]]
                }
                : new EmailResult
                {
                    Succeeded = true
                };
        }
    }
}
