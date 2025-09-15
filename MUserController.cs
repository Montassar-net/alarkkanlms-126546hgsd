using ALARKKAN.LMS.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ALARKKAN.LMS
{

    [ApiController]
    [Route("api/[controller]")]
    //  [Authorize]
    /// [Authorize(Roles = "Admin")]
    public class MUserController : ControllerBase
    {

        private readonly UserManager<ApplicationUser> _userManager;

        public MUserController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }


        [HttpPost]
        public async Task<IActionResult> AddUser([FromBody] AddUserModel model)
        {
            var user = new ApplicationUser { UserName = model.Username, Email = model.Email, Role = model.Role };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                var roleResult = await _userManager.AddToRoleAsync(user, model.Role);
                return Ok();
            }
            return BadRequest(result.Errors);
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> AssignRole(string id, [FromBody] string role)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Get the user's current roles
            var currentRoles = await _userManager.GetRolesAsync(user);

            // Remove all existing roles
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
            {
                return BadRequest(removeResult.Errors);
            }

            // Assign the new role
            var addResult = await _userManager.AddToRoleAsync(user, role);
            if (addResult.Succeeded)
            {
                return Ok(new { Message = "Role assigned successfully." });
            }

            // If adding the role fails, return the errors
            return BadRequest(addResult.Errors);
        }


        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = _userManager.Users.ToList(); // Retrieve all users
            var userList = new List<UserDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user); // Get roles for each user
                userList.Add(new UserDto
                {
                    Id = user.Id,
                    Username = user.UserName,
                    Email = user.Email,
                    Role = roles.FirstOrDefault() // Get the first role (assuming one role per user)
                });
            }

            return Ok(userList);
        }
        
        [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new
        {
            user.Id,
            user.UserName,
            user.Email,
            Role = roles.FirstOrDefault()
        });
    }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserModel model)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Update user properties
            user.UserName = model.Username;
            user.Email = model.Email;

            // Update the user
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            // Update the user's role
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRoleAsync(user, model.Role);

            return Ok();
        }



        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Delete the user
            var result = await _userManager.DeleteAsync(user);
            if (result.Succeeded)
            {
                return Ok(new { Message = "User deleted successfully." });
            }

            // If deletion fails, return the errors
            return BadRequest(result.Errors);
        }



    }

    

    // DTO (Data Transfer Object) for returning user information
    public class UserDto
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
    }

    public class UpdateUserModel
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
    }

}
