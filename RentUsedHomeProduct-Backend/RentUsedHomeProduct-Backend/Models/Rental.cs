using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentUsedHomeProduct_Backend.Models
{
    public class Rental
    {
        [Key]
        [Column("rental_id")]
        public int RentalId { get; set; }

        [Column("product_id")]
        public int ProductId { get; set; }

        [Column("owner_id")]
        public int OwnerId { get; set; }

        [Column("renter_id")]
        public int RenterId { get; set; }

        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Column("end_date")]
        public DateTime EndDate { get; set; }

        [Column("product_review")]
        public string ProductReview { get; set; }

        [Column("renter_review")]
        public string RenterReview { get; set; }

        [Column("product_rating")]
        public double ProductRating { get; set; }

        [Column("owner_rating")]
        public double OwnerRating { get; set; }

        [Column("renter_rating")]
        public double RenterRating { get; set; }

        [Column("total_amount")]
        public decimal TotalAmount { get; set; }

        [Column("status")]
        public string Status { get; set; } = "Pending";

        // Navigation Properties
        [ForeignKey("ProductId")]
        public Product Product { get; set; }

        [ForeignKey("OwnerId")]
        public User Owner { get; set; }

        [ForeignKey("RenterId")]
        public User Renter { get; set; }
    }
}