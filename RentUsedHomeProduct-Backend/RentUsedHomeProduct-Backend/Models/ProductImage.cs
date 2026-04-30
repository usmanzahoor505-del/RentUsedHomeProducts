using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentUsedHomeProduct_Backend.Models
{
    [Table("Product_Images")]
    public class ProductImage
    {
        [Key]
        [Column("image_id")]
        public int ImageId { get; set; }

        [Column("product_id")]
        public int ProductId { get; set; }

        [Column("image_url")]
        public string ImageUrl { get; set; }

        [Column("is_primary")]
        public bool IsPrimary { get; set; } = false;

        [ForeignKey("ProductId")]
        public Product Product { get; set; }
    }
}