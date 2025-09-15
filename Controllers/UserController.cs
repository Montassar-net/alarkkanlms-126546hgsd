using ALARKKAN.LMS.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace ALARKKAN.LMS.Controllers
{


    [ApiController]
    [Route("api/[controller]")]
    //  [Authorize]
    /// [Authorize(Roles = "Admin")]
    public class UserController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UserController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpPost]
        public async Task<IActionResult> AddUser([FromBody] AddUserModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = new ApplicationUser { UserName = model.Username, Email = model.Email };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
   
                var roleResult = await _userManager.AddToRoleAsync(user, model.Role);
                if (roleResult.Succeeded)
                {
                    return Ok(new { Message = "User created and role assigned successfully.", UserId = user.Id });
                }
                else
                {
                 
                    await _userManager.DeleteAsync(user);
                    return BadRequest(roleResult.Errors);
                }
            }

           
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
            return BadRequest(ModelState);
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> AssignRole(string id, [FromBody] string role)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.Role = role;
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok();
            }
            return BadRequest(result.Errors);
        }
    }
}
