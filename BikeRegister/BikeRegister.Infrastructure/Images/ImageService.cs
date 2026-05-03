using Azure;
using Azure.Core.Pipeline;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using BikeRegister.Application.DTOs.Images;
using BikeRegister.Application.Images;
using BikeRegister.Application.ResultModels;
using BikeRegister.Domain.Images;
using BikeRegister.SharedKernel.Localization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography.X509Certificates;

namespace BikeRegister.Infrastructure.Images
{
    public class ImageService(
        IConfiguration configuration,
        ILogger<ImageService> logger,
        IStringLocalizer<AppLocalization> localizer,
        IImageRepository imageRepository) : IImageService
    {
        readonly string ConnectionString = configuration["AzureBlobStorage:ConnectionString"]!;
        readonly string ContainerName = configuration["AzureBlobStorage:ContainerName"]!;
        readonly string AccountName = configuration["AzureBlobStorage:AccountName"]!;
        readonly string AccountKey = configuration["AzureBlobStorage:AccountKey"]!;

        private BlobContainerClient GetContainerClient()
        {
            if (configuration["ASPNETCORE_ENVIRONMENT"] == "Development")
            {
                HttpClientHandler handler = new()
                {
                    ServerCertificateCustomValidationCallback = (message, cert, chain, errors) =>
                    {
                        chain.ChainPolicy.RevocationMode = X509RevocationMode.NoCheck;
                        chain.ChainPolicy.VerificationFlags = X509VerificationFlags.AllowUnknownCertificateAuthority;
                        return chain.Build(cert);
                    }
                };
                HttpClient httpClient = new(handler);
                HttpClientTransport transport = new(httpClient);
                BlobClientOptions options = new() { Transport = transport };
                BlobServiceClient blobServiceClient = new(ConnectionString, options);
                return blobServiceClient.GetBlobContainerClient(ContainerName);
            }
            else
            {
                BlobServiceClient blobServiceClient = new(ConnectionString);
                return blobServiceClient.GetBlobContainerClient(ContainerName);
            }
        }

        public async Task<ImageResult> UploadRegistrationImagesAsync(string registrationId, List<SaveImageDto> images)
        {
            BlobContainerClient containerClient = GetContainerClient();

            List<Image> imagesList = [];

            var errorCount = 0;
            foreach (SaveImageDto image in images)
            {
                try
                {
                    BlobClient blobClient;
                    var blobName = $"{registrationId}/{image.OriginalFileName}";

                    blobClient = containerClient.GetBlobClient(blobName);
                    Response<BlobContentInfo> state = await blobClient.UploadAsync(content: image.StreamContent, overwrite: true);

                    Image i = SaveImageDto.ToFullImage(image, blobName, blobClient.Uri.ToString());
                    imagesList.Add(i);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "There was an error saving the image.");
                    errorCount++;
                }
            }

            var databaseSaved = true;

            if (imagesList.Count > 0)
            {
                databaseSaved = await imageRepository.CreateRegistrationImagesAsync(imagesList);
            }

            return errorCount > 0 && databaseSaved
                ? new ImageResult
                {
                    Succeeded = false,
                    Errors = [localizer["FileSaveError"]]
                }
                : new ImageResult
                {
                    Succeeded = true
                };
        }

        public async Task<ImageResult> UploadProfilePhotoAsync(string userId, SaveProfilePhotoDto image)
        {
            BlobContainerClient containerClient = GetContainerClient();

            try
            {
                BlobClient blobClient;
                var blobName = $"{userId}/profile-photo.png";

                blobClient = containerClient.GetBlobClient(blobName);
                Response<BlobContentInfo> state = await blobClient.UploadAsync(
                    content: image.StreamContent, overwrite: true);

                var blobUri = blobClient.Uri.ToString();

                return new ImageResult
                {
                    Succeeded = true,
                    BlobUri = blobUri,
                };
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "There was an error saving the image.");
                return new ImageResult
                {
                    Succeeded = false,
                    Errors = [localizer["ProfilePhotoError"]]
                };
            }
        }
    }
}
