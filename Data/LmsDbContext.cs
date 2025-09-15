using ALARKKAN.LMS.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

// Data/LmsDbContext.cs
public class LmsDbContext : IdentityDbContext<ApplicationUser>
{
    public DbSet<Course> Courses { get; set; }
    public DbSet<Class> Classes { get; set; }
    public DbSet<Enrollment> Enrollments { get; set; }
    public DbSet<Payment> Payments { get; set; } // Add this line

    public LmsDbContext(DbContextOptions<LmsDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.Trainee)
            .WithMany()
            .HasForeignKey(e => e.TraineeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Enrollment>()
            .HasOne(e => e.Class)
            .WithMany()
            .HasForeignKey(e => e.ClassId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Trainee)
            .WithMany()
            .HasForeignKey(p => p.TraineeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Course)
            .WithMany()
            .HasForeignKey(p => p.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Class>()
            .HasOne(c => c.Trainer)
            .WithMany()
            .HasForeignKey(c => c.TrainerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

