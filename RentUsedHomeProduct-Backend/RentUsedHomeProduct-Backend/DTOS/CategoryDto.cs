using System.Collections.Generic;

namespace RentUsedHomeProduct_Backend.DTOs
{
    public class CategoryDto
    {
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? Description { get; set; }
        public List<CategoryAttributeDto>? CategoryAttributes { get; set; }
    }
}
