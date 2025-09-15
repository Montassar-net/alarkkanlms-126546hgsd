using Microsoft.AspNetCore.Identity;

namespace ALARKKAN.LMS.helpers
{
    public static class UserSeeder
    {
        public static async Task SeedUsersAsync(IServiceProvider serviceProvider)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<IdentityUser>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var context = serviceProvider.GetRequiredService<LmsDbContext>();

            // Create roles if they don't exist
            string[] roleNames = { "ADMIN", "TRAINER", "TRAINEE" };
            foreach (var roleName in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

            // Seed Admin
            var adminUser = new IdentityUser
            {
                UserName = "admin",
                Email = "admin@alarkkan.net",
                EmailConfirmed = true
            };
            if (await userManager.FindByEmailAsync(adminUser.Email) == null)
            {
                await userManager.CreateAsync(adminUser, "Pass@12345");
                await userManager.AddToRoleAsync(adminUser, "ADMIN");
            }

            // Seed Trainer
            var trainerUser = new IdentityUser
            {
                UserName = "trainer",
                Email = "trainer@alarkkan.net",
                EmailConfirmed = true
            };
            if (await userManager.FindByEmailAsync(trainerUser.Email) == null)
            {
                await userManager.CreateAsync(trainerUser, "Pass@12345");
                await userManager.AddToRoleAsync(trainerUser, "TRAINER");
            }

            // Seed Trainee
            var traineeUser = new IdentityUser
            {
                UserName = "trainee",
                Email = "trainee@alarkkan.net",
                EmailConfirmed = true
            };
            if (await userManager.FindByEmailAsync(traineeUser.Email) == null)
            {
                await userManager.CreateAsync(traineeUser, "Pass@12345");
                await userManager.AddToRoleAsync(traineeUser, "TRAINEE");
            }

            await context.SaveChangesAsync();
        }
    }
}
