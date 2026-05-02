using Asp.Versioning;
using BikeRegister.Application;
using BikeRegister.Domain.Users;
using BikeRegister.Infrastructure;
using BikeRegister.Infrastructure.Persistence;
using BikeRegister.WebAPI.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Localization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Data Protection configuration
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo("Keys"))
    .SetApplicationName(builder.Configuration["Jwt:Issuer"] ?? throw new ArgumentNullException("Jwt:Issuer"));

// Custom implementations for Identity data protection (created by Gemini 3)
builder.Services.AddScoped<IPersonalDataProtector, CustomDataProtector>();
builder.Services.AddScoped<ILookupProtector, CustomLookupProtector>();
builder.Services.AddScoped<ILookupProtectorKeyRing, CustomKeyRing>();

// Add services to the container.
builder.Logging.ClearProviders();
builder.Logging
       .AddConsole()
       .AddDebug();

List<CultureInfo> supportedCultures = [.. new[] { "en-GB", "fi-FI" }.Select(c => new CultureInfo(c))];

builder.Services.AddLocalization(options =>
{
    options.ResourcesPath = "";
});

builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    options.DefaultRequestCulture = new RequestCulture("en-GB");
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;

    options.RequestCultureProviders =
    [
        new AcceptLanguageHeaderRequestCultureProvider()
    ];
});

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddSignalR(options => options.EnableDetailedErrors = true);

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"]!)),
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddIdentityCore<ApplicationUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

builder.Services.Configure<IdentityOptions>(options =>
{
    // Encrypts PersonalData in the database
    options.Stores.ProtectPersonalData = true;

    // Password settings.
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 8;
    options.Password.RequiredUniqueChars = 1;

    // Lockout settings.
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;

    // User settings.
    options.User.RequireUniqueEmail = true;

    // SignIn settings.
    options.SignIn.RequireConfirmedEmail = true;
    options.SignIn.RequireConfirmedPhoneNumber = false;
    options.SignIn.RequireConfirmedAccount = false;
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100MB
});

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi(options =>
{
    options.AddSchemaTransformer((schema, context, cancellationToken) =>
    {
        // If the schema represents our list of files
        if (context.JsonTypeInfo.Type == typeof(List<IFormFile>))
        {
            schema.Type = Microsoft.OpenApi.JsonSchemaType.Array;
            schema.Items = new Microsoft.OpenApi.OpenApiSchema
            {
                Type = Microsoft.OpenApi.JsonSchemaType.String,
                Format = "binary"
            };
        }
        return Task.CompletedTask;
    });

    options.AddOperationTransformer((operation, context, cancellationToken) =>
    {
        // Find the operation by ID or check if any parameter is IFormFile
        if (context.Description.ActionDescriptor.EndpointMetadata.OfType<IEndpointNameMetadata>().Any(x => x.EndpointName == "uploadRegistrationImages"))
        {
            IDictionary<string, OpenApiMediaType>? content = operation.RequestBody.Content;

            // Remove the incorrect url-encoded content if it exists
            if (content.ContainsKey("application/x-www-form-urlencoded"))
            {
                IOpenApiSchema? schema = content["application/x-www-form-urlencoded"].Schema;
                content.Remove("application/x-www-form-urlencoded");

                // Add the correct multipart/form-data content
                content.Add("multipart/form-data", new Microsoft.OpenApi.OpenApiMediaType
                {
                    Schema = schema
                });
            }
        }
        return Task.CompletedTask;
    });
});

builder.Services.AddApiVersioning(options =>
{
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.ReportApiVersions = true;

    options.ApiVersionReader = new UrlSegmentApiVersionReader();
}).AddMvc();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost",
        policyBuilder =>
        {
            policyBuilder.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
});

WebApplication app = builder.Build();

app.UseRequestLocalization();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowLocalhost");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
