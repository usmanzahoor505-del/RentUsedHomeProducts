using Microsoft.AspNetCore.Mvc;

using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using RentUsedHomeProduct_Backend.Models;

using  RentUsedHomeProduct_Backend.Data;
using RentUsedHomeProduct_Backend.DTOs;


namespace RentUsedHomeProduct_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public UsersController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // =====================
        // REGISTER
        // POST: api/users/register
        // =====================
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            try
            {
                // Check karo email already exist toh nahi karti
                if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                    return BadRequest(new { message = "Email already exists!" });

                // Check karo CNIC already exist toh nahi karti
                if (!string.IsNullOrEmpty(dto.CNIC) && await _context.Users.AnyAsync(u => u.CNIC == dto.CNIC))
                    return BadRequest(new { message = "CNIC already exists!" });

                // Password hash karo (BCrypt)
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

                var user = new User
                {
                    Username = dto.Username,
                    Email = dto.Email,
                    Password = hashedPassword,
                    City = dto.City,
                    PhoneNo = dto.PhoneNo,
                    CNIC = dto.CNIC,
                    AvgOwnerRating = 0,
                    AvgRenterRating = 0
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "User registered successfully!", userId = user.UserId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Registration Error", detail = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        // =====================
        // LOGIN
        // POST: api/users/login
        // =====================
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDtos dto)
        {
            try
            {
                Console.WriteLine($"Login attempt for: {dto.Email}");

                // User dhundo (Email ya Username dono se, case-insensitive aur Trimmed)
                string searchEmail = dto.Email?.Trim().ToLower() ?? "";
                var user = await _context.Users.FirstOrDefaultAsync(u => 
                    u.Email.ToLower() == searchEmail || 
                    u.Username.ToLower() == searchEmail);

                if (user == null)
                {
                    Console.WriteLine($"User not found: {searchEmail}");
                    return Unauthorized(new { 
                        message = "Invalid email or password!",
                        debugInfo = $"Tried to find user with Email or Username: {searchEmail}" 
                    });
                }

                // Password verify karo
                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.Password);
                if (!isPasswordValid)
                {
                    Console.WriteLine($"Password verification failed for: {searchEmail}");
                    return Unauthorized(new { 
                        message = "Invalid email or password!",
                        debugInfo = "User found but password verification failed."
                    });
                }

                // JWT Token banao
                Console.WriteLine("Generating JWT Token...");
                string token = GenerateJwtToken(user);
                Console.WriteLine("Login successful! (V2)");

                return Ok(new
                {
                    message = "Login successful! (V2)",
                    token = token,
                    userId = user.UserId,
                    username = user.Username,
                    email = user.Email,
                    city = user.City,
                    phone = user.PhoneNo,
                    cnic = user.CNIC
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"LOGIN CRASH: {ex.Message}");
                return StatusCode(500, new { 
                    message = "Login Exception (V2)", 
                    error = ex.Message, 
                    stackTrace = ex.StackTrace, 
                    inner = ex.InnerException?.Message 
                });
            }
        }

        // =====================
        // GET USER PROFILE & REVIEWS
        // GET: api/users/profile/1
        // =====================
        [HttpGet("profile/{id}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            var user = await _context.Users
                .Where(u => u.UserId == id)
                .Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.Email,
                    u.City,
                    u.PhoneNo,
                    u.AvgOwnerRating,
                    u.AvgRenterRating,
                    // Reviews as Owner (feedback for their products)
                    ReviewsAsOwner = _context.Rentals
                        .Where(r => r.OwnerId == id && r.Status == "Completed" && r.ProductRating > 0)
                        .Select(r => new {
                            r.RentalId,
                            r.ProductRating,
                            r.ProductReview,
                            RenterName = r.Renter.Username,
                            Date = r.EndDate
                        }).ToList(),
                    // Reviews as Renter (feedback for them as a customer)
                    ReviewsAsRenter = _context.Rentals
                        .Where(r => r.RenterId == id && r.Status == "Completed" && r.RenterRating > 0)
                        .Select(r => new {
                            r.RentalId,
                            r.RenterRating,
                            r.RenterReview,
                            OwnerName = r.Owner.Username,
                            Date = r.EndDate
                        }).ToList()
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound("User not found!");

            return Ok(user);
        }

        // =====================
        // JWT Token Generate
        // =====================
        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(
                    double.Parse(_configuration["JwtSettings:ExpiryDays"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}


namespace RentUsedHomeProduct_Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Add DbSet<T> properties here, e.g.
        // public DbSet<User> Users { get; set; }
    }
}
