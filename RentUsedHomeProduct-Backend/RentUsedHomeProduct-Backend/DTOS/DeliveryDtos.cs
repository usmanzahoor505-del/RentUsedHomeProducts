namespace RentUsedHomeProduct_Backend.DTOs
{
    public class AcceptDeliveryDto
    {
        public int CourierId { get; set; }
    }

    public class UpdateCourierLocationDto
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }

    public class PickupDeliveryDto
    {
        public string PickupOtp { get; set; } = string.Empty;
        public string? ConditionPhotos { get; set; } // JSON string or URLs
    }

    public class DropoffDeliveryDto
    {
        public string DropoffOtp { get; set; } = string.Empty;
    }

    public class CourierStatusDto
    {
        public bool IsOnline { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}
