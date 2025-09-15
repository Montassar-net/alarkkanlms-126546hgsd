using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ALARKKAN.LMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ALARKKAN.LMS.Controllers
{
    // Attributes that define the controller's behavior and routing.
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Requires authentication for all actions in this controller.
    public class ClassesController : ControllerBase
    {
        private readonly LmsDbContext _context;

        // Dependency injection of the LmsDbContext.
        public ClassesController(LmsDbContext context)
        {
            _context = context;
        }

        // GET: api/Classes
        // Retrieves a list of all classes from the database.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Class>>> GetClasses()
        {
            var classes = await _context.Classes
        .Include(c => c.Course) // Include the Course navigation property
        .Include(c => c.Trainer) // Include the Course navigation property
        .Select(c => new ClassDto
        {
            Id = c.Id,
            CourseId = c.CourseId,
            CourseName = c.Course.Name, // Include the course name
            Time = c.Time,
            Location = c.Location,
            IsOpen = c.IsOpen,
            TrainerName = c.Trainer.UserName
        })
        .ToListAsync();

            return Ok(classes);
        }

        // GET: api/Classes/5
        // Retrieves a specific class by its ID.
        [HttpGet("{id}")]
        public async Task<ActionResult<Class>> GetClass(int id)
        {
            var classItem = await _context.Classes.FindAsync(id);

            if (classItem == null)
            {
                return NotFound();
            }

            return Ok(classItem);
        }

        [HttpGet("ByCourse/{courseId}")]
        public async Task<ActionResult<IEnumerable<Class>>> GetClassesByCourseId(int courseId)
        {
            var classes = await _context.Classes
                .Include(c => c.Course)
                .Where(c => c.CourseId == courseId)
                .ToListAsync();

            if (classes == null || !classes.Any())
            {
                // Returning NotFound is appropriate if no classes are found for the course.
                return NotFound($"No classes found for Course ID: {courseId}.");
            }

            return Ok(classes);
        }


        [HttpPost]
        [Authorize(Roles = "Trainer")] 
        public async Task<ActionResult<Class>> AddClass([FromBody] AddClassModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var trainerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var newClass = new Class
            {
                CourseId = model.CourseId,
                Time = model.Time,
                Location = model.Location,
                IsOpen = model.IsOpen,
                TrainerId =  trainerId
        };

            _context.Classes.Add(newClass);
            await _context.SaveChangesAsync();

            // Returns a 201 Created status code with a URI to the newly created resource.
            return CreatedAtAction(nameof(GetClass), new { id = newClass.Id }, newClass);
        }

        // PUT: api/Classes/5
        // Updates an existing class in the database.
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Trainer")]
        public async Task<IActionResult> UpdateClass(int id, [FromBody] Class updatedClass)
        {
            if (id != updatedClass.Id)
            {
                return BadRequest("Class ID mismatch.");
            }

            _context.Entry(updatedClass).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Classes.Any(e => e.Id == id))
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


        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,Trainer")]
        public async Task<IActionResult> UpdateClassOpenStatus(int id, [FromBody] bool isOpen)
        {
            // Find the class by its ID.
            var classToUpdate = await _context.Classes.FindAsync(id);

            if (classToUpdate == null)
            {
                return NotFound();
            }

            // Update only the IsOpen property.
            classToUpdate.IsOpen = isOpen;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Handle concurrency issues if the record was deleted by another process.
                if (!_context.Classes.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw; // Re-throw the exception if it's another type of issue.
                }
            }

            return NoContent(); // Return 204 No Content on success.
        }

        // DELETE: api/Classes/5
        // Deletes a class from the database by its ID.
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Trainer")]
        public async Task<IActionResult> DeleteClass(int id)
        {
            var classItem = await _context.Classes.FindAsync(id);
            if (classItem == null)
            {
                return NotFound();
            }

            _context.Classes.Remove(classItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class ClassDto
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; } // Add this line
        public DateTime Time { get; set; }
        public string Location { get; set; }
        public bool IsOpen { get; set; }

        public string TrainerName { get; set; }
    }


    public class AddClassModel
    {
        public int CourseId { get; set; }
        public DateTime Time { get; set; }
        public string Location { get; set; } = string.Empty;
        public bool IsOpen { get; set; }
    }
}
