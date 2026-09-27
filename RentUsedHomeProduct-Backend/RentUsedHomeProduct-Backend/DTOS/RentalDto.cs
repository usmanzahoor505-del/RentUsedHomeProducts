namespace RentUsedHomeProduct_Backend.DTOs
{
    public class RentalDto
    {

        public int ProductId { get; set; }
        public int OwnerId { get; set; }
        public int RenterId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? DeliveryOption { get; set; } = "SelfPickup";
        public string? DeliveryAddress { get; set; }
        public double? DeliveryLat { get; set; }
        public double? DeliveryLng { get; set; }
        public decimal? DeliveryFee { get; set; }
    }
}
