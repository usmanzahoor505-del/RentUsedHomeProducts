using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentUsedHomeProduct_Backend.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [Column("username")]
        public string Username { get; set; }

        [Required]
        [Column("email")]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        [Column("city")]
        public string City { get; set; }

        [Column("phone_no")]
        public string PhoneNo { get; set; }

        [Column("cnic")]
        public string? CNIC { get; set; }

        [Column("avg_owner_rating")]
        public double AvgOwnerRating { get; set; }

        [Column("avg_renter_rating")]
        public double AvgRenterRating { get; set; }

        [Column("role")]
        public string Role { get; set; } = "Customer";

        [Column("vehicle_type")]
        public string? VehicleType { get; set; }

        [Column("vehicle_plate")]
        public string? VehiclePlate { get; set; }

        [Column("is_online")]
        public bool IsOnline { get; set; } = false;

        [Column("current_latitude")]
        public double? CurrentLatitude { get; set; }

        [Column("current_longitude")]
        public double? CurrentLongitude { get; set; }

        [Column("last_location_updated")]
        public DateTime? LastLocationUpdated { get; set; }
    }

}
