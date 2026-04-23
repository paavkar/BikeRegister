using BikeRegister.Domain.Registrations;
using BikeRegister.Domain.Users;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BikeRegister.Infrastructure.Persistence
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<ApplicationUser>(options)
    {
        public DbSet<Registration> Registrations { get; set; }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Registration>()
                .HasOne(r => r.User)
                .WithMany(u => u.Registrations)
                .HasForeignKey(r => r.UserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Registration>()
                .HasIndex(r => r.SerialNumber);

            builder.Entity<Registration>()
                .HasIndex(r => r.UserId);

            builder.Entity<Registration>()
                .HasIndex(r => r.Brand);

            builder.Entity<Registration>()
                .HasIndex(r => r.City);
        }
    }
}
