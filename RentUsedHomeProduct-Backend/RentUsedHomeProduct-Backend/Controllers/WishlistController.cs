using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentUsedHomeProduct_Backend.DTOs;
using RentUsedHomeProduct_Backend.Models;

namespace RentUsedHomeProduct_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WishlistController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WishlistController(AppDbContext context)
        {
            _context = context;
        }

        // =====================
        // TOGGLE WISHLIST ITEM
        // POST: api/wishlist/toggle
        // =====================
        [HttpPost("toggle")]
        public async Task<IActionResult> Toggle(ToggleWishlistDto dto)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == dto.UserId);
            if (!userExists)
                return NotFound(new { message = "User not found!" });

            var productExists = await _context.Products.AnyAsync(p => p.ProductId == dto.ProductId);
            if (!productExists)
                return NotFound(new { message = "Product not found!" });

            var existing = await _context.Wishlists
                .FirstOrDefaultAsync(w => w.UserId == dto.UserId && w.ProductId == dto.ProductId);

            if (existing != null)
            {
                _context.Wishlists.Remove(existing);
                await _context.SaveChangesAsync();
                return Ok(new { inWishlist = false, message = "Removed from wishlist!" });
            }
            else
            {
                var wishlistItem = new Wishlist
                {
                    UserId = dto.UserId,
                    ProductId = dto.ProductId,
                    NotifyOnAvailable = dto.NotifyOnAvailable ?? true,
                    CreatedAt = DateTime.Now
                };

                _context.Wishlists.Add(wishlistItem);
                await _context.SaveChangesAsync();
                return Ok(new { inWishlist = true, message = "Added to wishlist! You will be notified when available." });
            }
        }

        // =====================
        // CHECK IF PRODUCT IS IN WISHLIST
        // GET: api/wishlist/check/1/5
        // =====================
        [HttpGet("check/{userId}/{productId}")]
        public async Task<IActionResult> Check(int userId, int productId)
        {
            var exists = await _context.Wishlists
                .AnyAsync(w => w.UserId == userId && w.ProductId == productId);

            return Ok(new { inWishlist = exists });
        }

        // =====================
        // GET USER'S WISHLIST
        // GET: api/wishlist/my/1
        // =====================
        [HttpGet("my/{userId}")]
        public async Task<IActionResult> GetMyWishlist(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
                return NotFound(new { message = "User not found!" });

            var wishlist = await _context.Wishlists
                .Where(w => w.UserId == userId)
                .Include(w => w.Product)
                    .ThenInclude(p => p.User)
                .Include(w => w.Product)
                    .ThenInclude(p => p.ProductImages)
                .OrderByDescending(w => w.CreatedAt)
                .Select(w => new
                {
                    w.WishlistId,
                    w.NotifyOnAvailable,
                    w.CreatedAt,
                    Product = new
                    {
                        w.Product.ProductId,
                        w.Product.Title,
                        w.Product.Description,
                        w.Product.PricePerDay,
                        w.Product.Condition,
                        w.Product.Status,
                        w.Product.Location,
                        w.Product.AvgRating,
                        PrimaryImage = w.Product.ProductImages
                            .Where(img => img.IsPrimary)
                            .Select(img => img.ImageUrl)
                            .FirstOrDefault() ?? w.Product.ProductImages
                            .Select(img => img.ImageUrl)
                            .FirstOrDefault(),
                        Owner = new
                        {
                            w.Product.User.UserId,
                            w.Product.User.Username,
                            w.Product.User.City
                        }
                    }
                })
                .ToListAsync();

            return Ok(wishlist);
        }

        // =====================
        // REMOVE FROM WISHLIST BY ID
        // DELETE: api/wishlist/1
        // =====================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Remove(int id)
        {
            var item = await _context.Wishlists.FindAsync(id);
            if (item == null)
                return NotFound(new { message = "Wishlist item not found!" });

            _context.Wishlists.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Item removed from wishlist!" });
        }
    }
}
