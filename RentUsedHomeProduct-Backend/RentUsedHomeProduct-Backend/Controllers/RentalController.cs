using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentUsedHomeProduct_Backend.Data;

using RentUsedHomeProduct_Backend.DTOs;
using RentUsedHomeProduct_Backend.Models;

namespace RentUsedHomeProduct_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RentalController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RentalController(AppDbContext context)
        {
            _context = context;
        }

        // =====================
        // GET ALL RENTALS
        // GET: api/rentals
        // =====================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var rentals = await _context.Rentals
                .Include(r => r.Product)
                .Include(r => r.Owner)
                .Include(r => r.Renter)
                .Select(r => new
                {
                    r.RentalId,
                    Product = new { 
                        r.Product.ProductId, 
                        r.Product.Title,
                        PrimaryImage = r.Product.ProductImages.Where(img => img.IsPrimary).Select(img => img.ImageUrl).FirstOrDefault() ?? r.Product.ProductImages.Select(img => img.ImageUrl).FirstOrDefault()
                    },
                    Owner = new { r.Owner.UserId, r.Owner.Username },
                    Renter = new { r.Renter.UserId, r.Renter.Username },
                    r.StartDate,
                    r.EndDate,
                    r.TotalAmount,
                    r.Status,
                    r.ProductRating,
                    r.OwnerRating,
                    r.RenterRating,
                    r.ProductReview,
                    r.RenterReview
                })
                .ToListAsync();

            return Ok(rentals);
        }

        // =====================
        // GET SINGLE RENTAL
        // GET: api/rentals/1
        // =====================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var rental = await _context.Rentals
                .Include(r => r.Product)
                .Include(r => r.Owner)
                .Include(r => r.Renter)
                .Where(r => r.RentalId == id)
                .Select(r => new
                {
                    r.RentalId,
                    Product = new { r.Product.ProductId, r.Product.Title },
                    Owner = new { r.Owner.UserId, r.Owner.Username },
                    Renter = new { r.Renter.UserId, r.Renter.Username },
                    r.StartDate,
                    r.EndDate,
                    r.Status,
                    r.ProductRating,
                    r.OwnerRating,
                    r.RenterRating,
                    r.ProductReview,
                    r.RenterReview
                })
                .FirstOrDefaultAsync();

            if (rental == null)
                return NotFound(new { message = "Rental not found!" });

            return Ok(rental);
        }

        // =====================
        // GET RENTALS BY USER (As Renter)
        // GET: api/rentals/byrenter/1
        // =====================
        [HttpGet("byrenter/{renterId}")]
        public async Task<IActionResult> GetByRenter(int renterId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == renterId);
            if (!userExists)
                return NotFound(new { message = "User not found!" });

            var rentals = await _context.Rentals
                .Where(r => r.RenterId == renterId)
                .Include(r => r.Product)
                .Include(r => r.Owner)
                .Select(r => new
                {
                    r.RentalId,
                    Product = new { 
                        r.Product.ProductId, 
                        r.Product.Title,
                        PrimaryImage = r.Product.ProductImages.Where(img => img.IsPrimary).Select(img => img.ImageUrl).FirstOrDefault() ?? r.Product.ProductImages.Select(img => img.ImageUrl).FirstOrDefault()
                    },
                    Owner = new { r.Owner.UserId, r.Owner.Username },
                    r.StartDate,
                    r.EndDate,
                    r.TotalAmount,
                    r.Status,
                    r.ProductRating,
                    r.OwnerRating,
                    r.ProductReview
                })
                .ToListAsync();

            return Ok(rentals);
        }

        // =====================
        // GET RENTALS BY USER (As Owner)
        // GET: api/rentals/byowner/1
        // =====================
        [HttpGet("byowner/{ownerId}")]
        public async Task<IActionResult> GetByOwner(int ownerId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == ownerId);
            if (!userExists)
                return NotFound(new { message = "User not found!" });

            var rentals = await _context.Rentals
                .Where(r => r.OwnerId == ownerId)
                .Include(r => r.Product)
                .Include(r => r.Renter)
                .Select(r => new
                {
                    r.RentalId,
                    Product = new { 
                        r.Product.ProductId, 
                        r.Product.Title,
                        PrimaryImage = r.Product.ProductImages.Where(img => img.IsPrimary).Select(img => img.ImageUrl).FirstOrDefault() ?? r.Product.ProductImages.Select(img => img.ImageUrl).FirstOrDefault()
                    },
                    Renter = new { 
                        r.Renter.UserId, 
                        r.Renter.Username,
                        AvgRating = r.Renter.AvgRenterRating 
                    },
                    r.StartDate,
                    r.EndDate,
                    r.TotalAmount,
                    r.Status,
                    r.RenterRating,
                    r.RenterReview
                })
                .ToListAsync();

            return Ok(rentals);
        }

        // =====================
        // DATE FILTER - CHECK AVAILABILITY
        // GET: api/rentals/availability/1?startDate=2024-01-01&endDate=2024-01-10
        // =====================
        [HttpGet("availability/{productId}")]
        public async Task<IActionResult> CheckAvailability(int productId, DateTime startDate, DateTime endDate)
        {
            var productExists = await _context.Products.AnyAsync(p => p.ProductId == productId);
            if (!productExists)
                return NotFound(new { message = "Product not found!" });

            // Check karo koi existing rental in dates pe overlap toh nahi karti
            var isBooked = await _context.Rentals
                .AnyAsync(r => r.ProductId == productId &&
                               r.Status != "Cancelled" &&
                               r.Status != "Completed" &&
                               r.StartDate < endDate &&
                               r.EndDate > startDate);

            if (isBooked)
                return Ok(new { available = false, message = "Product is not available for selected dates!" });

            return Ok(new { available = true, message = "Product is available for selected dates!" });
        }

        // =====================
        // CREATE RENTAL (BOOKING)
        // POST: api/rentals
        // =====================
        [HttpPost]
        public async Task<IActionResult> Create(RentalDto dto)
        {
            // Validate dates
            if (dto.StartDate >= dto.EndDate)
                return BadRequest(new { message = "End date must be after start date!" });

            if (dto.StartDate < DateTime.Today)
                return BadRequest(new { message = "Start date cannot be in the past!" });

            // Product exist karta hai?
            var productExists = await _context.Products.AnyAsync(p => p.ProductId == dto.ProductId);
            if (!productExists)
                return NotFound(new { message = "Product not found!" });

            // Owner aur Renter exist karte hain?
            var ownerExists = await _context.Users.AnyAsync(u => u.UserId == dto.OwnerId);
            if (!ownerExists)
                return NotFound(new { message = "Owner not found!" });

            var renterExists = await _context.Users.AnyAsync(u => u.UserId == dto.RenterId);
            if (!renterExists)
                return NotFound(new { message = "Renter not found!" });

            // Owner aur Renter same toh nahi?
            if (dto.OwnerId == dto.RenterId)
                return BadRequest(new { message = "Owner and renter cannot be the same person!" });

            // Date availability check
            var isBooked = await _context.Rentals
                .AnyAsync(r => r.ProductId == dto.ProductId &&
                               r.Status != "Cancelled" &&
                               r.Status != "Completed" &&
                               r.StartDate < dto.EndDate &&
                               r.EndDate > dto.StartDate);

            if (isBooked)
                return BadRequest(new { message = "Product is not available for selected dates!" });

            // Step 1: Get product price per day
            var product = await _context.Products.FindAsync(dto.ProductId);
            
            // Step 2: Calculate days
            var totalDays = (dto.EndDate - dto.StartDate).Days;
            if (totalDays <= 0) totalDays = 1; // Minimum 1 day charge

            var rental = new Rental
            {
                ProductId = dto.ProductId,
                OwnerId = dto.OwnerId,
                RenterId = dto.RenterId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                TotalAmount = product.PricePerDay * totalDays, // Auto calculate
                Status = "Pending"
            };

            _context.Rentals.Add(rental);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Rental booked successfully!", rentalId = rental.RentalId });
        }

        // =====================
        // UPDATE RENTAL STATUS
        // PUT: api/rentals/status/1
        // =====================
        [HttpPut("status/{id}")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var rental = await _context.Rentals.FindAsync(id);
            if (rental == null)
                return NotFound(new { message = "Rental not found!" });

            var validStatuses = new[] { "Pending", "Active", "Awaiting_Return", "Completed", "Cancelled" };
            if (!validStatuses.Contains(status))
                return BadRequest(new { message = "Invalid status! Valid: Pending, Active, Awaiting_Return, Completed, Cancelled" });

            rental.Status = status;

            // Sync with Product Status
            var product = await _context.Products.FindAsync(rental.ProductId);
            if (product != null)
            {
                if (status == "Active") product.Status = "Rented";
                else if (status == "Cancelled") product.Status = "Available";
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Rental status updated to {status}!" });
        }

        // =====================
        // RATE PRODUCT + OWNER (By Renter)
        // PUT: api/rentals/rate-product/1
        // =====================
        [HttpPut("rate-product/{id}")]
        public async Task<IActionResult> RateProduct(int id, RateProductDto dto)
        {
            var rental = await _context.Rentals.FindAsync(id);
            if (rental == null)
                return NotFound(new { message = "Rental not found!" });

            if (rental.Status != "Completed")
                return BadRequest(new { message = "You can only rate after rental is completed!" });

            if (dto.ProductRating < 1 || dto.ProductRating > 5)
                return BadRequest(new { message = "Product rating must be between 1 and 5!" });

            if (dto.OwnerRating < 1 || dto.OwnerRating > 5)
                return BadRequest(new { message = "Owner rating must be between 1 and 5!" });

            // Step 1: Ratings save karo
            rental.ProductRating = dto.ProductRating;
            rental.ProductReview = dto.ProductReview;
            rental.OwnerRating = dto.OwnerRating;
            await _context.SaveChangesAsync();

            // Step 2: Owner ki average rating update karo
            var avgOwnerRating = await _context.Rentals
                .Where(r => r.OwnerId == rental.OwnerId && r.OwnerRating > 0)
                .AverageAsync(r => r.OwnerRating);
            var owner = await _context.Users.FindAsync(rental.OwnerId);
            owner.AvgOwnerRating = (double)avgOwnerRating;

            // Step 3: Product ki average rating update karo
            var avgProductRating = await _context.Rentals
                .Where(r => r.ProductId == rental.ProductId && r.ProductRating > 0)
                .AverageAsync(r => r.ProductRating);
            var product = await _context.Products.FindAsync(rental.ProductId);
            product.AvgRating = (double)avgProductRating;

            // Step 4: Sab ek saath save karo
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product and owner rated successfully!" });
        }

        // =====================
        // CONFIRM RETURN (By Owner)
        // PUT: api/rental/confirm-return/1
        // =====================
        [HttpPut("confirm-return/{id}")]
        public async Task<IActionResult> ConfirmReturn(int id, ConfirmReturnDto dto)
        {
            var rental = await _context.Rentals.FindAsync(id);
            if (rental == null)
                return NotFound(new { message = "Rental not found!" });

            if (rental.Status != "Active" && rental.Status != "ReturnRequested" && rental.Status != "Awaiting_Return")
                return BadRequest(new { message = "Only active or return-requested rentals can be confirmed!" });

            // Save Owner's rating for the renter/experience
            rental.RenterRating = dto.RenterRating;
            rental.RenterReview = dto.RenterReview;
            rental.Status = "Completed";

            // Mark product as available again
            var product = await _context.Products.FindAsync(rental.ProductId);
            if (product != null)
            {
                product.Status = "Available";
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Return confirmed, product is now Available!" });
        }

        // =====================
        // DELETE RENTAL
        // DELETE: api/rentals/1
        // =====================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var rental = await _context.Rentals.FindAsync(id);
            if (rental == null)
                return NotFound(new { message = "Rental not found!" });

            _context.Rentals.Remove(rental);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Rental deleted successfully!" });
        }
    }
}