using ALARKKAN.LMS.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ALARKKAN.LMS.Controllers
{


    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly LmsDbContext _context;

        public PaymentController(LmsDbContext context)
        {
            _context = context;
        }

        // GET: api/payment
        [HttpGet]
        public async Task<IActionResult> GetPayments()
        {
            var payments = await _context.Payments.ToListAsync();
            return Ok(payments);
        }

        // GET: api/payment/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPayment(int id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null)
            {
                return NotFound();
            }
            return Ok(payment);
        }

        // POST: api/payment
        [HttpPost]
        public async Task<IActionResult> AddPayment([FromBody] Payment payment)
        {
            payment.PaymentDate = DateTime.UtcNow; // Set the payment date to the current time
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();
            return Ok(payment);
        }

        // DELETE: api/payment/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null)
            {
                return NotFound();
            }

            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

}
