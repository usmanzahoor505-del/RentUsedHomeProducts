using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentUsedHomeProduct_Backend.Data;

using RentUsedHomeProduct_Backend.DTOs;
using RentUsedHomeProduct_Backend.Models;

namespace RentUsedHomeProduct_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductAttributeValuesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductAttributeValuesController(AppDbContext context)
        {
            _context = context;
        }

        // =====================
        // GET ALL VALUES OF A PRODUCT
        // GET: api/productattributevalues/byproduct/1
        // =====================
        [HttpGet("byproduct/{productId}")]
        public async Task<IActionResult> GetByProduct(int productId)
        {
            var values = await _context.Product_Attribute_Values
                .Where(v => v.ProductId == productId)
                .Include(v => v.CategoryAttribute)
                .ToListAsync();

            if (!values.Any())
                return NotFound(new { message = "No attribute values found for this product!" });

            return Ok(values);
        }

    }
}