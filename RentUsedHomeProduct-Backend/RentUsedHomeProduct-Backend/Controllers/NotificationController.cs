using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentUsedHomeProduct_Backend.Models;

namespace RentUsedHomeProduct_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificationController(AppDbContext context)
        {
            _context = context;
        }

        // =====================
        // GET USER NOTIFICATIONS
        // GET: api/notification/my/1
        // =====================
        [HttpGet("my/{userId}")]
        public async Task<IActionResult> GetMyNotifications(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
                return NotFound(new { message = "User not found!" });

            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .Include(n => n.Product)
                    .ThenInclude(p => p.ProductImages)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new
                {
                    n.NotificationId,
                    n.Title,
                    n.Message,
                    n.Type,
                    n.IsRead,
                    n.CreatedAt,
                    Product = n.Product == null ? null : new
                    {
                        n.Product.ProductId,
                        n.Product.Title,
                        n.Product.PricePerDay,
                        n.Product.Status,
                        PrimaryImage = n.Product.ProductImages
                            .Where(img => img.IsPrimary)
                            .Select(img => img.ImageUrl)
                            .FirstOrDefault() ?? n.Product.ProductImages
                            .Select(img => img.ImageUrl)
                            .FirstOrDefault()
                    }
                })
                .ToListAsync();

            return Ok(notifications);
        }

        // =====================
        // GET UNREAD NOTIFICATION COUNT
        // GET: api/notification/unread-count/1
        // =====================
        [HttpGet("unread-count/{userId}")]
        public async Task<IActionResult> GetUnreadCount(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
                return NotFound(new { message = "User not found!" });

            var count = await _context.Notifications
                .CountAsync(n => n.UserId == userId && !n.IsRead);

            return Ok(new { unreadCount = count });
        }

        // =====================
        // MARK NOTIFICATION AS READ
        // PUT: api/notification/mark-read/1
        // =====================
        [HttpPut("mark-read/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
                return NotFound(new { message = "Notification not found!" });

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Notification marked as read!" });
        }

        // =====================
        // MARK ALL AS READ
        // PUT: api/notification/mark-all-read/1
        // =====================
        [HttpPut("mark-all-read/{userId}")]
        public async Task<IActionResult> MarkAllAsRead(int userId)
        {
            var unreadNotifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var n in unreadNotifications)
            {
                n.IsRead = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Marked {unreadNotifications.Count} notifications as read!" });
        }

        // =====================
        // DELETE NOTIFICATION
        // DELETE: api/notification/1
        // =====================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
                return NotFound(new { message = "Notification not found!" });

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Notification deleted successfully!" });
        }
    }
}
