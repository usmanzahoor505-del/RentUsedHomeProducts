using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentUsedHomeProduct_Backend.Models
{
    [Table("Wishlists")]
    public class Wishlist
    {
        [Key]
        [Column("wishlist_id")]
        public int WishlistId { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("product_id")]
        public int ProductId { get; set; }

        [Column("notify_on_available")]
        public bool NotifyOnAvailable { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigations
        [ForeignKey("UserId")]
        public User? User { get; set; }

        [ForeignKey("ProductId")]
        public Product? Product { get; set; }
    }
}
