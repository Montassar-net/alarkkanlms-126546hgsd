using ALARKKAN.LMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace ALARKKAN.LMS.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CourseController : ControllerBase
    {
        private readonly LmsDbContext _context;

        public CourseController(LmsDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCourses()
        {
            var courses = await _context.Courses.ToListAsync();
            return Ok(courses);
        }
        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCourseById(int id)
        {
            var course = await _context.Courses.FindAsync(id);

            if (course == null)
            {
                return NotFound();
            }

            return Ok(course);
        }


        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddCourse([FromBody] AddCourseModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var course = new Course
            {
                Name = model.Name,
                Description = model.Description,
                Price = model.Price // Add this line
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();
            return Ok();
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCourse(int id, [FromBody] Course updatedCourse)
        {
            if (id != updatedCourse.Id)
            {
                return BadRequest("Course ID mismatch.");
            }

            _context.Entry(updatedCourse).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Courses.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpPost("register")]
        public async Task<IActionResult> RegisterForCourse([FromBody] RegisterCourseModel model)
        {
            var course = await _context.Courses.FindAsync(model.CourseId);
            if (course == null)
            {
                return NotFound("Course not found.");
            }

            var user = await _context.Users.FindAsync(model.TraineeId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Create a payment record
            var payment = new Payment
            {
                TraineeId = model.TraineeId,
                CourseId = model.CourseId,
                Amount = course.Price, // Assuming Course has a Price property
                PaymentDate = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Course registration and payment successful.", PaymentId = payment.Id });
        }


        public class AddCourseModel
        {
            public string Name { get; set; }
            public string Description { get; set; }
            public decimal Price { get; set; } // Add this line
        }

        public class RegisterCourseModel
        {
            public string TraineeId { get; set; }
            public int CourseId { get; set; }
        }
    }

}
