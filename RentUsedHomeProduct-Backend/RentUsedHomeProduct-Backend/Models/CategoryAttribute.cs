using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentUsedHomeProduct_Backend.Models
{
    [Table("Category_Attributes")] // <- map to exact table name in DB
    public class CategoryAttribute
    {
        [Key]
        [Column("attribute_id")]
        public int AttributeId { get; set; }

        [Column("name")]
        public string? Name { get; set; }

        [Column("type")]
        public string? Type { get; set; }

        [Column("attributes_list")]
        public string? AttributesList { get; set; }

        [Column("category_id")]
        public int CategoryId { get; set; }

        // Navigation Property
        [System.Text.Json.Serialization.JsonIgnore]
        public Category? Category { get; set; }

        public ICollection<ProductAttributeValue> ProductAttributeValues { get; set; }
    }
}