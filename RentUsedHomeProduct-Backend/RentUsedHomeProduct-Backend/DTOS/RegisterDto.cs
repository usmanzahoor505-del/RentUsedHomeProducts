namespace RentUsedHomeProduct_Backend.DTOs
{

    public class RegisterDto
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string City { get; set; }
        public string PhoneNo { get; set; }
        public string? CNIC { get; set; }
    }

}
