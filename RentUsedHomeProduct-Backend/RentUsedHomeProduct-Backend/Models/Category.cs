using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentUsedHomeProduct_Backend.Models
{
    public class Category
    {
        [Key]
        [Column("category_id")] // maps to SQL column
        public int CategoryId { get; set; }

        [Column("category_name")] // maps to SQL column
        public string? CategoryName { get; set; }

        [Column("description")] // maps to SQL column
        public string? Description { get; set; }

        [Column("parent_id")]
        public int? ParentId { get; set; }

        // Navigation Properties
        [ForeignKey("ParentId")]
        [System.Text.Json.Serialization.JsonIgnore]
        public Category? ParentCategory { get; set; }
        public ICollection<Category> SubCategories { get; set; }

        [System.Text.Json.Serialization.JsonIgnore]
        public ICollection<Product> Products { get; set; }
        public ICollection<CategoryAttribute> CategoryAttributes { get; set; }
    }
}