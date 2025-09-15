namespace ALARKKAN.LMS.Models
{
    using Microsoft.AspNetCore.Identity;
    using System.Collections.Generic;

    public class ApplicationUser : IdentityUser
    {
        public string Role { get; set; }
        public ICollection<Payment> Payments { get; set; } // Add this line
    }
}
