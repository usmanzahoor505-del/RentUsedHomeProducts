using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentUsedHomeProduct_Backend.Data;
using RentUsedHomeProduct_Backend.DTOs;
using RentUsedHomeProduct_Backend.Models;

namespace RentUsedHomeProduct_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ProductsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // =====================
        // GET ALL PRODUCTS
        // GET: api/products
        // =====================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _context.Products
                .Include(p => p.User)
                .Include(p => p.Category)
                .Include(p => p.ProductAttributeValues)
                    .ThenInclude(pav => pav.CategoryAttribute)
                .Include(p => p.ProductImages)
                .Select(p => new
                {
                    p.ProductId,
                    p.Title,
                    p.Description,
                    p.Condition,
                    p.PricePerDay,
                    p.Status,
                    p.Location,
                    p.AvgRating,
                    Owner = new
                    {
                        p.User.UserId,
                        p.User.Username,
                        p.User.City,
                        p.User.PhoneNo
                    },
                    Category = new
                    {
                        p.Category.CategoryId,
                        p.Category.CategoryName
                    },
                    Attributes = p.ProductAttributeValues.Select(pav => new
                    {
                        AttributeName = pav.CategoryAttribute.Name,
                        AttributeType = pav.CategoryAttribute.Type,
                        pav.Value
                    }),
                    Images = p.ProductImages.Select(img => new
                    {
                        img.ImageId,
                        img.ImageUrl,
                        img.IsPrimary
                    })
                })
                .ToListAsync();

            return Ok(products);
        }

        // =====================
        // GET SINGLE PRODUCT
        // GET: api/products/1
        // =====================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _context.Products
                .Include(p => p.User)
                .Include(p => p.Category)
                .Include(p => p.ProductAttributeValues)
                    .ThenInclude(pav => pav.CategoryAttribute)
                .Include(p => p.ProductImages)
                .Where(p => p.ProductId == id)
                .Select(p => new
                {
                    p.ProductId,
                    p.Title,
                    p.Description,
                    p.Condition,
                    p.PricePerDay,
                    p.Status,
                    p.Location,
                    p.AvgRating,
                    Owner = new
                    {
                        p.User.UserId,
                        p.User.Username,
                        p.User.City,
                        p.User.PhoneNo
                    },
                    Category = new
                    {
                        p.Category.CategoryId,
                        p.Category.CategoryName
                    },
                    Attributes = p.ProductAttributeValues.Select(pav => new
                    {
                        AttributeName = pav.CategoryAttribute.Name,
                        AttributeType = pav.CategoryAttribute.Type,
                        pav.Value
                    }),
                    Images = p.ProductImages.Select(img => new
                    {
                        img.ImageId,
                        img.ImageUrl,
                        img.IsPrimary
                    })
                })
                .FirstOrDefaultAsync();

            if (product == null)
                return NotFound(new { message = "Product not found!" });

            return Ok(product);
        }

        // =====================
        // GET PRODUCTS BY USER
        // GET: api/products/byuser/1
        // =====================
        [HttpGet("byuser/{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
                return NotFound(new { message = "User not found!" });

            var products = await _context.Products
                .Where(p => p.UserId == userId)
                .Include(p => p.Category)
                .Include(p => p.ProductAttributeValues)
                    .ThenInclude(pav => pav.CategoryAttribute)
                .Include(p => p.ProductImages)
                .Select(p => new
                {
                    p.ProductId,
                    p.Title,
                    p.Description,
                    p.Condition,
                    p.PricePerDay,
                    p.Status,
                    p.Location,
                    p.AvgRating,
                    Category = new
                    {
                        p.Category.CategoryId,
                        p.Category.CategoryName
                    },
                    Attributes = p.ProductAttributeValues.Select(pav => new
                    {
                        AttributeName = pav.CategoryAttribute.Name,
                        pav.Value
                    }),
                    Images = p.ProductImages.Select(img => new
                    {
                        img.ImageId,
                        img.ImageUrl,
                        img.IsPrimary
                    })
                })
                .ToListAsync();

            return Ok(products);
        }

        // =====================
        // GET PRODUCTS BY CATEGORY
        // GET: api/products/bycategory/1
        // =====================
        [HttpGet("bycategory/{categoryId}")]
        public async Task<IActionResult> GetByCategory(int categoryId)
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.CategoryId == categoryId);
            if (!categoryExists)
                return NotFound(new { message = "Category not found!" });

            var products = await _context.Products
                .Where(p => p.CategoryId == categoryId)
                .Include(p => p.User)
                .Include(p => p.ProductAttributeValues)
                    .ThenInclude(pav => pav.CategoryAttribute)
                .Include(p => p.ProductImages)
                .Select(p => new
                {
                    p.ProductId,
                    p.Title,
                    p.Description,
                    p.Condition,
                    p.PricePerDay,
                    p.Status,
                    p.AvgRating,
                    Owner = new
                    {
                        p.User.UserId,
                        p.User.Username,
                        p.User.City
                    },
                    Attributes = p.ProductAttributeValues.Select(pav => new
                    {
                        AttributeName = pav.CategoryAttribute.Name,
                        pav.Value
                    }),
                    Images = p.ProductImages.Select(img => new
                    {
                        img.ImageId,
                        img.ImageUrl,
                        img.IsPrimary
                    })
                })
                .ToListAsync();

            return Ok(products);
        }

        // =====================
        // CREATE PRODUCT
        // POST: api/products
        // =====================
        [HttpPost]
        public async Task<IActionResult> Create(ProductDto dto)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == dto.UserId);
            if (!userExists)
                return NotFound(new { message = "User not found!" });

            var categoryExists = await _context.Categories.AnyAsync(c => c.CategoryId == dto.CategoryId);
            if (!categoryExists)
                return NotFound(new { message = "Category not found!" });

            var product = new Product
            {
                Title = dto.Title,
                Description = dto.Description,
                UserId = dto.UserId,
                CategoryId = dto.CategoryId,
                SubCategoryId = dto.SubCategoryId, // Saved here
                Condition = dto.Condition,
                PricePerDay = dto.PricePerDay,
                Status = dto.Status,
                Location = dto.Location
            };

            if (dto.Attributes != null && dto.Attributes.Any())
            {
                product.ProductAttributeValues = dto.Attributes.Select(a => new ProductAttributeValue
                {
                    CategoryAttributeId = a.AttributeId, // Use the actual attribute ID
                    AttributeName = a.AttributeName,
                    Value = a.Value
                }).ToList();
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product and Attributes saved successfully!", productId = product.ProductId });
        }

        // =====================
        // UPLOAD PRODUCT IMAGES
        // POST: api/products/upload-images/1
        // =====================
        [HttpPost("upload-images/{productId}")]
        [DisableRequestSizeLimit]
        public async Task<IActionResult> UploadImages(int productId, [FromForm] List<IFormFile> images, [FromQuery] bool isPrimary = false)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                return NotFound(new { message = "Product not found!" });

            if (images == null || images.Count == 0)
                return BadRequest(new { message = "No images provided!" });

            // Uploads folder banao
            var uploadFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "products");
            Directory.CreateDirectory(uploadFolder);

            var uploadedImages = new List<object>();

            foreach (var image in images)
            {
                // File extension check karo
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                var extension = Path.GetExtension(image.FileName).ToLower();
                if (!allowedExtensions.Contains(extension))
                    return BadRequest(new { message = "Only jpg, jpeg, png, webp allowed!" });

                // Unique filename banao
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadFolder, fileName);

                // File save karo
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                // Database mein save karo
                var productImage = new ProductImage
                {
                    ProductId = productId,
                    ImageUrl = $"/uploads/products/{fileName}",
                    IsPrimary = isPrimary
                };

                _context.ProductImages.Add(productImage);
                uploadedImages.Add(new { productImage.ImageUrl, productImage.IsPrimary });
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Images uploaded successfully!", images = uploadedImages });
        }

        // =====================
        // UPDATE PRODUCT
        // PUT: api/products/1
        // =====================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ProductDto dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found!" });

            var categoryExists = await _context.Categories.AnyAsync(c => c.CategoryId == dto.CategoryId);
            if (!categoryExists)
                return NotFound(new { message = "Category not found!" });

            product.Title = dto.Title;
            product.Description = dto.Description;
            product.CategoryId = dto.CategoryId;
            product.Condition = dto.Condition;
            product.PricePerDay = dto.PricePerDay;
            product.Status = dto.Status;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Product updated successfully!" });
        }

        // =====================
        // DELETE PRODUCT IMAGE
        // DELETE: api/products/delete-image/1
        // =====================
        [HttpDelete("delete-image/{imageId}")]
        public async Task<IActionResult> DeleteImage(int imageId)
        {
            var image = await _context.ProductImages.FindAsync(imageId);
            if (image == null)
                return NotFound(new { message = "Image not found!" });

            // File bhi delete karo
            var filePath = Path.Combine(_env.WebRootPath ?? "wwwroot", image.ImageUrl.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);

            _context.ProductImages.Remove(image);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Image deleted successfully!" });
        }

        // =====================
        // DELETE PRODUCT
        // DELETE: api/products/1
        // =====================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found!" });

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product deleted successfully!" });
        }
    }
}