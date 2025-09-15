using ALARKKAN.LMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ALARKKAN.LMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Requires authentication for all actions in this controller.
    public class EnrollmentController : ControllerBase
    {
        private readonly LmsDbContext _context;

        public EnrollmentController(LmsDbContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<IActionResult> GetEnrollments()
        {
            var enrollments = await _context.Enrollments
                .Include(e => e.Trainee)
                .Include(e => e.Class)
                .Select(e => new
                {
                    e.Id,
                    e.EnrollmentDate,
                    TraineeName = e.Trainee.UserName,
                    ClassName = e.Class.Course.Name,
                    ClassTime = e.Class.Time
                })
                .ToListAsync();

            return Ok(enrollments);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetEnrollmentById(int id)
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.Trainee)
                .Include(e => e.Class)
                .Select(e => new
                {
                    e.Id,
                    e.EnrollmentDate,
                    TraineeId = e.TraineeId,
                    TraineeName = e.Trainee.UserName,
                    ClassId = e.ClassId,
                    ClassName = e.Class.Course.Name,
                    ClassTime = e.Class.Time,
                    ClassLocation = e.Class.Location
                })
                .FirstOrDefaultAsync(e => e.Id == id);

            if (enrollment == null)
            {
                return NotFound();
            }

            return Ok(enrollment);
        }


        [HttpGet("ByTrainer")]
        [Authorize(Roles = "Trainer")]
        public async Task<IActionResult> GetEnrollmentsByTrainerId()
        {
            // Securely get the trainer's ID from the JWT token claims.
            var trainerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(trainerId))
            {
                // This is a safeguard if the token is missing the user ID.
                return Unauthorized("Trainer ID not found in token.");
            }

            // Find all classes associated with this trainer.
            var trainerClassIds = await _context.Classes
                .Where(c => c.TrainerId == trainerId)
                .Select(c => c.Id)
                .ToListAsync();

            if (!trainerClassIds.Any())
            {
                return NotFound("No classes found for this trainer.");
            }

            // Find all enrollments for the classes found above.
            var enrollments = await _context.Enrollments
                .Include(e => e.Trainee)
                .Include(e => e.Class)
                    .ThenInclude(c => c.Course)
                .Where(e => trainerClassIds.Contains(e.ClassId))
                .Select(e => new
                {
                    e.Id,
                    e.EnrollmentDate,
                    TraineeName = e.Trainee.UserName,
                    ClassName = e.Class.Course.Name,
                    ClassTime = e.Class.Time,
                    ClassLocation = e.Class.Location
                })
                .ToListAsync();

            return Ok(enrollments);
        }


        [HttpGet("MyEnrollments")]
        [Authorize(Roles = "Trainee")]
        public async Task<IActionResult> GetMyEnrollments()
        {
            // Securely get the trainee's ID from the JWT token.
            var traineeId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(traineeId))
            {
                // This should not happen with proper token validation, but it's a good safeguard.
                return Unauthorized("User ID not found in token.");
            }

            var myEnrollments = await _context.Enrollments
                .Include(e => e.Class)
                .ThenInclude(c => c.Course)
                .Where(e => e.TraineeId == traineeId) // Filter by the current user's ID.
                .Select(e => new
                {
                    e.Id,
                    e.EnrollmentDate,
                    ClassName = e.Class.Course.Name,
                    ClassTime = e.Class.Time,
                    ClassLocation = e.Class.Location
                })
                .ToListAsync();

            return Ok(myEnrollments);
        }


        /// <summary>
        /// Creates a new enrollment for a trainee in a class.
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Trainee")]
        [HttpPost]
        [Authorize(Roles = "Trainee")]
        public async Task<IActionResult> AddEnrollment([FromBody] AddEnrollmentModel model)
        {
            // Get the current user's ID from the claims (more secure)
            var traineeId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // IMPORTANT: Check if the traineeId was found.
            if (string.IsNullOrEmpty(traineeId))
            {
                return Unauthorized("The user's ID could not be found in the token. Ensure the token contains the 'NameIdentifier' claim.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if the trainee is already enrolled in this class to prevent duplicates.
            var existingEnrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.TraineeId == traineeId && e.ClassId == model.ClassId);

            if (existingEnrollment != null)
            {
                return BadRequest("Trainee is already enrolled in this class.");
            }

            // Check if the class is open for enrollment.
            var classToEnroll = await _context.Classes.FindAsync(model.ClassId);
            if (classToEnroll == null || !classToEnroll.IsOpen)
            {
                return BadRequest("The specified class is not open for enrollment.");
            }

            var enrollment = new Enrollment
            {
                TraineeId = traineeId, // Use the ID from the token
                ClassId = model.ClassId,
                EnrollmentDate = DateTime.UtcNow
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEnrollmentById), new { id = enrollment.Id }, enrollment);
        }

        /// <summary>
        /// Deletes an enrollment by ID.
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Trainer")]
        public async Task<IActionResult> DeleteEnrollment(int id)
        {
            var enrollment = await _context.Enrollments.FindAsync(id);
            if (enrollment == null)
            {
                return NotFound();
            }

            _context.Enrollments.Remove(enrollment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }

    public class AddEnrollmentModel
    {

        [Required]
        public int ClassId { get; set; }
    }
}
