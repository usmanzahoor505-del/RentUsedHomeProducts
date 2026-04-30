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
    public class CategoryAttributesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoryAttributesController(AppDbContext context)
        {
            _context = context;
        }

        // =====================
        // GET ALL ATTRIBUTES OF A CATEGORY
        // GET: api/categoryattributes/bycategory/1
        // =====================
        [HttpGet("bycategory/{categoryId}")]
        public async Task<IActionResult> GetByCategory(int categoryId)
        {
            var attributes = await _context.CategoryAttributes
                .Where(a => a.CategoryId == categoryId)
                .ToListAsync();

            if (!attributes.Any())
                return NotFound(new { message = "No attributes found for this category!" });

            return Ok(attributes);
        }

        // =====================
        // GET SINGLE ATTRIBUTE
        // GET: api/categoryattributes/1
        // =====================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var attribute = await _context.CategoryAttributes.FindAsync(id);

            if (attribute == null)
                return NotFound(new { message = "Attribute not found!" });

            return Ok(attribute);
        }

    }
}