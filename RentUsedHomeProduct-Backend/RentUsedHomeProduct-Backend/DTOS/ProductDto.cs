using System.ComponentModel.DataAnnotations;

namespace RentUsedHomeProduct_Backend.DTOs
{
    public class ProductDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int UserId { get; set; }
        public int CategoryId { get; set; }
        public int SubCategoryId { get; set; }
        [Required]
        public int Condition { get; set; }
        public decimal PricePerDay { get; set; }
        public string Status { get; set; } = "Available";
        public string Location { get; set; }
        public List<ProductAttributeValueDto> Attributes { get; set; }
    }
}