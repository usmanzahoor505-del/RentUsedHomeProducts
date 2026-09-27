using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentUsedHomeProduct_Backend.Models
{
    [Table("Deliveries")]
    public class Delivery
    {
        [Key]
        [Column("delivery_id")]
        public int DeliveryId { get; set; }

        [Column("rental_id")]
        public int RentalId { get; set; }

        [Column("courier_id")]
        public int? CourierId { get; set; }

        [Column("status")]
        public string Status { get; set; } = "Pending"; // "Pending", "Assigned", "HeadingToPickup", "PickedUp", "InTransit", "Delivered", "Cancelled"

        [Column("pickup_address")]
        public string? PickupAddress { get; set; }

        [Column("pickup_latitude")]
        public double? PickupLatitude { get; set; }

        [Column("pickup_longitude")]
        public double? PickupLongitude { get; set; }

        [Column("dropoff_address")]
        public string? DropoffAddress { get; set; }

        [Column("dropoff_latitude")]
        public double? DropoffLatitude { get; set; }

        [Column("dropoff_longitude")]
        public double? DropoffLongitude { get; set; }

        [Column("distance_km")]
        public double? DistanceKm { get; set; }

        [Column("delivery_fee")]
        public decimal DeliveryFee { get; set; } = 200;

        [Column("pickup_otp")]
        public string? PickupOtp { get; set; }

        [Column("dropoff_otp")]
        public string? DropoffOtp { get; set; }

        [Column("condition_photos")]
        public string? ConditionPhotos { get; set; }

        [Column("courier_latitude")]
        public double? CourierLatitude { get; set; }

        [Column("courier_longitude")]
        public double? CourierLongitude { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("picked_up_at")]
        public DateTime? PickedUpAt { get; set; }

        [Column("delivered_at")]
        public DateTime? DeliveredAt { get; set; }

        // Navigation Properties
        [ForeignKey("RentalId")]
        public Rental? Rental { get; set; }

        [ForeignKey("CourierId")]
        public User? Courier { get; set; }
    }
}
