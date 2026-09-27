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
        // GET ALL PRODUCTS (With optional Nearby Location & Radius filter, sorted by Reviews Descending)
        // GET: api/products?lat=33.5973&lng=73.0479&radiusKm=5
        // =====================
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] double? lat = null, [FromQuery] double? lng = null, [FromQuery] double? radiusKm = null)
        {
            // Pre-calculate review counts per product from Rentals table
            var reviewCounts = await _context.Rentals
                .Where(r => r.ProductRating > 0 || !string.IsNullOrEmpty(r.ProductReview))
                .GroupBy(r => r.ProductId)
                .Select(g => new { ProductId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.ProductId, g => g.Count);

            var productsQuery = await _context.Products
                .Where(p => p.Status == "Available" || p.Status == "Rented")
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
                    p.Latitude,
                    p.Longitude,
                    p.RadiusKm,
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

            if (lat.HasValue && lng.HasValue)
            {
                var userLat = lat.Value;
                var userLng = lng.Value;

                var withDistance = productsQuery.Select(p =>
                {
                    double? dist = null;
                    if (p.Latitude.HasValue && p.Longitude.HasValue)
                    {
                        dist = CalculateHaversineDistance(userLat, userLng, p.Latitude.Value, p.Longitude.Value);
                    }
                    var revCount = reviewCounts.ContainsKey(p.ProductId) ? reviewCounts[p.ProductId] : 0;

                    return new
                    {
                        p.ProductId,
                        p.Title,
                        p.Description,
                        p.Condition,
                        p.PricePerDay,
                        p.Status,
                        p.Location,
                        p.Latitude,
                        p.Longitude,
                        p.RadiusKm,
                        p.AvgRating,
                        ReviewCount = revCount,
                        p.Owner,
                        p.Category,
                        p.Attributes,
                        p.Images,
                        DistanceKm = dist
                    };
                });

                if (radiusKm.HasValue && radiusKm.Value > 0)
                {
                    withDistance = withDistance
                        .Where(p => p.DistanceKm.HasValue && p.DistanceKm.Value <= radiusKm.Value);
                }

                // Rank by Maximum Reviews in Descending Order, then by Nearest Distance
                var ranked = withDistance
                    .OrderByDescending(p => p.ReviewCount)
                    .ThenBy(p => p.DistanceKm ?? 999999)
                    .ToList();

                return Ok(ranked);
            }

            // When no lat/lng provided: Sort by Maximum Reviews Descending
            var sortedAll = productsQuery.Select(p => new
            {
                p.ProductId,
                p.Title,
                p.Description,
                p.Condition,
                p.PricePerDay,
                p.Status,
                p.Location,
                p.Latitude,
                p.Longitude,
                p.RadiusKm,
                p.AvgRating,
                ReviewCount = reviewCounts.ContainsKey(p.ProductId) ? reviewCounts[p.ProductId] : 0,
                p.Owner,
                p.Category,
                p.Attributes,
                p.Images,
                DistanceKm = (double?)null
            })
            .OrderByDescending(p => p.ReviewCount)
            .ToList();

            return Ok(sortedAll);
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
                    p.Latitude,
                    p.Longitude,
                    p.RadiusKm,
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

            var reviewCount = await _context.Rentals
                .CountAsync(r => r.ProductId == id && (r.ProductRating > 0 || !string.IsNullOrEmpty(r.ProductReview)));

            var reviews = await _context.Rentals
                .Where(r => r.ProductId == id && (r.ProductRating > 0 || !string.IsNullOrEmpty(r.ProductReview)))
                .Include(r => r.Renter)
                .Select(r => new
                {
                    r.RentalId,
                    r.ProductRating,
                    r.ProductReview,
                    RenterName = r.Renter != null ? r.Renter.Username : "Verified Renter",
                    r.EndDate
                })
                .ToListAsync();

            return Ok(new
            {
                product.ProductId,
                product.Title,
                product.Description,
                product.Condition,
                product.PricePerDay,
                product.Status,
                product.Location,
                product.Latitude,
                product.Longitude,
                product.RadiusKm,
                product.AvgRating,
                ReviewCount = reviewCount,
                Reviews = reviews,
                product.Owner,
                product.Category,
                product.Attributes,
                product.Images
            });
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
                    p.Latitude,
                    p.Longitude,
                    p.RadiusKm,
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
                Location = dto.Location,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                RadiusKm = dto.RadiusKm ?? 5.0
            };

            if (dto.Attributes != null && dto.Attributes.Any())
            {
                var validAttrIds = await _context.CategoryAttributes.Select(ca => ca.AttributeId).ToListAsync();
                product.ProductAttributeValues = new List<ProductAttributeValue>();

                foreach (var a in dto.Attributes)
                {
                    int attrId = a.AttributeId;
                    if (!validAttrIds.Contains(attrId))
                    {
                        // Fallback: match by name and SubCategoryId / CategoryId
                        var match = await _context.CategoryAttributes
                            .FirstOrDefaultAsync(ca => ca.Name.ToLower() == a.AttributeName.ToLower() && 
                                                      (ca.CategoryId == dto.SubCategoryId || ca.CategoryId == dto.CategoryId));
                        if (match != null)
                        {
                            attrId = match.AttributeId;
                        }
                    }

                    if (validAttrIds.Contains(attrId))
                    {
                        product.ProductAttributeValues.Add(new ProductAttributeValue
                        {
                            CategoryAttributeId = attrId,
                            AttributeName = a.AttributeName ?? "Attribute",
                            Value = a.Value ?? ""
                        });
                    }
                }
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
        public async Task<IActionResult> UploadImages(int productId, [FromForm] List<IFormFile>? images = null, [FromQuery] bool isPrimary = false)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                return NotFound(new { message = "Product not found!" });

            // Collect all uploaded files from both Request.Form.Files and parameter
            var files = new List<IFormFile>();
            if (Request.Form.Files.Count > 0)
            {
                files.AddRange(Request.Form.Files);
            }
            else if (images != null && images.Count > 0)
            {
                files.AddRange(images);
            }

            if (files.Count == 0)
                return BadRequest(new { message = "No images provided!" });

            // Resolve web root path reliably
            var webRoot = !string.IsNullOrEmpty(_env.WebRootPath)
                ? _env.WebRootPath
                : Path.Combine(_env.ContentRootPath, "wwwroot");

            var uploadFolder = Path.Combine(webRoot, "uploads", "products");
            if (!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var uploadedImages = new List<object>();

            // Check if product already has a primary image
            bool hasPrimary = await _context.ProductImages.AnyAsync(pi => pi.ProductId == productId && pi.IsPrimary == true);

            for (int i = 0; i < files.Count; i++)
            {
                var image = files[i];
                if (image.Length == 0) continue;

                var extension = Path.GetExtension(image.FileName)?.ToLower();
                if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
                {
                    // Fallback to Content-Type if FileName lacks extension (common on mobile content:// URIs)
                    var ctype = image.ContentType?.ToLower();
                    if (ctype == "image/png")
                        extension = ".png";
                    else if (ctype == "image/webp")
                        extension = ".webp";
                    else if (ctype == "image/jpeg" || ctype == "image/jpg")
                        extension = ".jpg";
                    else if (ctype != null && ctype.StartsWith("image/"))
                        extension = ".jpg";
                    else
                        extension = ".jpg"; // safe default
                }

                // Create unique filename
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                // If product has no primary image, make the first uploaded image primary
                bool shouldBePrimary = isPrimary;
                if (!hasPrimary)
                {
                    shouldBePrimary = true;
                    hasPrimary = true; // only set once
                }

                var productImage = new ProductImage
                {
                    ProductId = productId,
                    ImageUrl = $"/uploads/products/{fileName}",
                    IsPrimary = shouldBePrimary
                };

                _context.ProductImages.Add(productImage);
                uploadedImages.Add(new { productImage.ImageUrl, productImage.IsPrimary });
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Images uploaded successfully!", count = uploadedImages.Count, images = uploadedImages });
        }

        public class Base64ImagesRequest
        {
            public List<string>? Images { get; set; }
            public bool IsPrimary { get; set; } = false;
        }

        // =====================
        // UPLOAD PRODUCT IMAGES (BASE64 JSON)
        // POST: api/products/upload-base64-images/1
        // =====================
        [HttpPost("upload-base64-images/{productId}")]
        [DisableRequestSizeLimit]
        public async Task<IActionResult> UploadBase64Images(int productId, [FromBody] Base64ImagesRequest request)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                return NotFound(new { message = "Product not found!" });

            if (request?.Images == null || request.Images.Count == 0)
                return BadRequest(new { message = "No base64 images provided!" });

            var webRoot = !string.IsNullOrEmpty(_env.WebRootPath)
                ? _env.WebRootPath
                : Path.Combine(_env.ContentRootPath, "wwwroot");

            var uploadFolder = Path.Combine(webRoot, "uploads", "products");
            if (!Directory.Exists(uploadFolder))
            {
                Directory.CreateDirectory(uploadFolder);
            }

            var uploadedImages = new List<object>();
            bool hasPrimary = await _context.ProductImages.AnyAsync(pi => pi.ProductId == productId && pi.IsPrimary == true);

            for (int i = 0; i < request.Images.Count; i++)
            {
                var raw = request.Images[i];
                if (string.IsNullOrWhiteSpace(raw)) continue;

                string extension = ".jpg";
                string base64Data = raw;

                if (raw.Contains(","))
                {
                    var parts = raw.Split(',');
                    var header = parts[0].ToLower();
                    base64Data = parts[1];

                    if (header.Contains("image/png")) extension = ".png";
                    else if (header.Contains("image/webp")) extension = ".webp";
                    else extension = ".jpg";
                }

                try
                {
                    byte[] imageBytes = Convert.FromBase64String(base64Data);
                    if (imageBytes.Length == 0) continue;

                    var fileName = $"{Guid.NewGuid()}{extension}";
                    var filePath = Path.Combine(uploadFolder, fileName);

                    await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);

                    bool shouldBePrimary = request.IsPrimary;
                    if (!hasPrimary)
                    {
                        shouldBePrimary = true;
                        hasPrimary = true;
                    }

                    var productImage = new ProductImage
                    {
                        ProductId = productId,
                        ImageUrl = $"/uploads/products/{fileName}",
                        IsPrimary = shouldBePrimary
                    };

                    _context.ProductImages.Add(productImage);
                    uploadedImages.Add(new { productImage.ImageUrl, productImage.IsPrimary });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error decoding base64 image {i}: {ex.Message}");
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Images uploaded successfully!", count = uploadedImages.Count, images = uploadedImages });
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
            if (dto.SubCategoryId > 0)
                product.SubCategoryId = dto.SubCategoryId;
            product.Condition = dto.Condition;
            product.PricePerDay = dto.PricePerDay;
            product.Status = dto.Status;
            if (!string.IsNullOrEmpty(dto.Location))
                product.Location = dto.Location;
            if (dto.Latitude.HasValue)
                product.Latitude = dto.Latitude;
            if (dto.Longitude.HasValue)
                product.Longitude = dto.Longitude;
            if (dto.RadiusKm.HasValue)
                product.RadiusKm = dto.RadiusKm;

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

            var webRoot = !string.IsNullOrEmpty(_env.WebRootPath)
                ? _env.WebRootPath
                : Path.Combine(_env.ContentRootPath, "wwwroot");

            var filePath = Path.Combine(webRoot, image.ImageUrl.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
            {
                try
                {
                    System.IO.File.Delete(filePath);
                }
                catch
                {
                    // Ignore file delete errors if locked
                }
            }

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
            var product = await _context.Products
                .Include(p => p.ProductImages)
                .Include(p => p.ProductAttributeValues)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
                return NotFound(new { message = "Product not found!" });

            if (product.ProductImages != null && product.ProductImages.Any())
            {
                var webRoot = !string.IsNullOrEmpty(_env.WebRootPath)
                    ? _env.WebRootPath
                    : Path.Combine(_env.ContentRootPath, "wwwroot");

                foreach (var img in product.ProductImages)
                {
                    var filePath = Path.Combine(webRoot, img.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(filePath))
                    {
                        try { System.IO.File.Delete(filePath); } catch { }
                    }
                }
                _context.ProductImages.RemoveRange(product.ProductImages);
            }

            if (product.ProductAttributeValues != null && product.ProductAttributeValues.Any())
            {
                _context.Product_Attribute_Values.RemoveRange(product.ProductAttributeValues);
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product deleted successfully!" });
        }

        private static double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // Earth's radius in kilometers
            var dLat = (lat2 - lat1) * Math.PI / 180.0;
            var dLon = (lon2 - lon1) * Math.PI / 180.0;

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(lat1 * Math.PI / 180.0) * Math.Cos(lat2 * Math.PI / 180.0) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return Math.Round(R * c, 1);
        }
    }
}