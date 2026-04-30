using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentUsedHomeProduct_Backend.Models
{
    public class Product
    {
        [Key]
        [Column("product_id")]
        public int ProductId { get; set; }

        [Column("title")]
        public string? Title { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("category_id")] // Main Category
        public int CategoryId { get; set; }

        [Column("sub_category_id")] // Sub Category (Category_Attributes table)
        public int SubCategoryId { get; set; }

        [Column("condition")]
        public int Condition { get; set; }

        [Column("price_per_day")]
        public decimal PricePerDay { get; set; }

        [Column("status")]
        public string? Status { get; set; } = "Available";

        [Column("location")]
        public string? Location { get; set; }

        [Column("avg_rating")]
        public double AvgRating { get; set; }

        // Navigation Properties
        [ForeignKey("UserId")]
        public User? User { get; set; }

        [ForeignKey("CategoryId")]
        public Category? Category { get; set; }

        [ForeignKey("SubCategoryId")]
        public CategoryAttribute? SubCategory { get; set; }

        public ICollection<ProductAttributeValue>? ProductAttributeValues { get; set; }

        // Multivalue Attribute
        public ICollection<ProductImage>? ProductImages { get; set; }
    }
}