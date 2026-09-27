namespace RentUsedHomeProduct_Backend.DTOs
{
    public class ToggleWishlistDto
    {
        public int UserId { get; set; }
        public int ProductId { get; set; }
        public bool? NotifyOnAvailable { get; set; } = true;
    }
}
