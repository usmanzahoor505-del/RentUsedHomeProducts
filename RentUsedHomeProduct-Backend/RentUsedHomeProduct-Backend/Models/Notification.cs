using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentUsedHomeProduct_Backend.Models
{
    [Table("Notifications")]
    public class Notification
    {
        [Key]
        [Column("notification_id")]
        public int NotificationId { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("product_id")]
        public int? ProductId { get; set; }

        [Required]
        [Column("title")]
        public string Title { get; set; }

        [Required]
        [Column("message")]
        public string Message { get; set; }

        [Column("type")]
        public string Type { get; set; } = "Availability";

        [Column("is_read")]
        public bool IsRead { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigations
        [ForeignKey("UserId")]
        public User? User { get; set; }

        [ForeignKey("ProductId")]
        public Product? Product { get; set; }
    }
}
