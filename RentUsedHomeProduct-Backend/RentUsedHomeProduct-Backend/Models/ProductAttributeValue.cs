using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentUsedHomeProduct_Backend.Models
{
    [Table("Product_Attribute_Values")]  // ← Yeh bilkul sahi jagah hai
    public class ProductAttributeValue
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("product_id")]
        public int ProductId { get; set; }

        [Column("category_attribute_id")]
        public int CategoryAttributeId { get; set; }

        [Column("attribute_name")]
        public string AttributeName { get; set; }

        [Column("value")]
        public string Value { get; set; }

        [ForeignKey("ProductId")]
        public Product Product { get; set; }

        [ForeignKey("CategoryAttributeId")]
        public CategoryAttribute CategoryAttribute { get; set; }
    }
}