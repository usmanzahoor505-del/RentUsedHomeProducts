using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentUsedHomeProduct_Backend.Data;
using RentUsedHomeProduct_Backend.DTOs;
using RentUsedHomeProduct_Backend.Models;

namespace RentUsedHomeProduct_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DeliveriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DeliveriesController(AppDbContext context)
        {
            _context = context;
        }

        // =====================
        // GET AVAILABLE DELIVERIES (Nearest to Courier)
        // GET: api/deliveries/available?lat=33.5973&lng=73.0479&city=Rawalpindi
        // =====================
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailable([FromQuery] double? lat, [FromQuery] double? lng, [FromQuery] string? city)
        {
            var query = _context.Deliveries
                .Include(d => d.Rental)
                    .ThenInclude(r => r.Product)
                        .ThenInclude(p => p.ProductImages)
                .Include(d => d.Rental)
                    .ThenInclude(r => r.Owner)
                .Include(d => d.Rental)
                    .ThenInclude(r => r.Renter)
                .Where(d => d.Status == "Pending" && d.CourierId == null);

            var list = await query.ToListAsync();

            var result = list.Select(d =>
            {
                double dist = 0;
                if (lat.HasValue && lng.HasValue && d.PickupLatitude.HasValue && d.PickupLongitude.HasValue)
                {
                    dist = CalculateDistance(lat.Value, lng.Value, d.PickupLatitude.Value, d.PickupLongitude.Value);
                }

                var primaryImg = d.Rental?.Product?.ProductImages?.FirstOrDefault(i => i.IsPrimary)?.ImageUrl 
                    ?? d.Rental?.Product?.ProductImages?.FirstOrDefault()?.ImageUrl;

                return new
                {
                    d.DeliveryId,
                    d.RentalId,
                    d.Status,
                    d.PickupAddress,
                    d.PickupLatitude,
                    d.PickupLongitude,
                    d.DropoffAddress,
                    d.DropoffLatitude,
                    d.DropoffLongitude,
                    d.DeliveryFee,
                    DistanceToPickupKm = Math.Round(dist, 1),
                    TripDistanceKm = d.DistanceKm.HasValue ? Math.Round(d.DistanceKm.Value, 1) : 3.5,
                    Product = new
                    {
                        d.Rental?.Product?.ProductId,
                        d.Rental?.Product?.Title,
                        d.Rental?.Product?.PricePerDay,
                        PrimaryImage = primaryImg
                    },
                    Owner = new
                    {
                        d.Rental?.Owner?.UserId,
                        d.Rental?.Owner?.Username,
                        d.Rental?.Owner?.PhoneNo,
                        d.Rental?.Owner?.City
                    },
                    Renter = new
                    {
                        d.Rental?.Renter?.UserId,
                        d.Rental?.Renter?.Username,
                        d.Rental?.Renter?.PhoneNo,
                        d.Rental?.Renter?.City
                    },
                    d.CreatedAt
                };
            })
            .OrderBy(d => d.DistanceToPickupKm)
            .ToList();

            return Ok(result);
        }

        // =====================
        // GET ACTIVE DELIVERY FOR COURIER
        // GET: api/deliveries/active/{courierId}
        // =====================
        [HttpGet("active/{courierId}")]
        public async Task<IActionResult> GetActiveByCourier(int courierId)
        {
            var activeStatuses = new[] { "Assigned", "HeadingToPickup", "PickedUp", "InTransit" };

            var delivery = await _context.Deliveries
                .Include(d => d.Rental)
                    .ThenInclude(r => r.Product)
                        .ThenInclude(p => p.ProductImages)
                .Include(d => d.Rental)
                    .ThenInclude(r => r.Owner)
                .Include(d => d.Rental)
                    .ThenInclude(r => r.Renter)
                .Include(d => d.Courier)
                .Where(d => d.CourierId == courierId && activeStatuses.Contains(d.Status))
                .OrderByDescending(d => d.DeliveryId)
                .FirstOrDefaultAsync();

            if (delivery == null)
                return Ok(new { hasActive = false });

            var primaryImg = delivery.Rental?.Product?.ProductImages?.FirstOrDefault(i => i.IsPrimary)?.ImageUrl 
                ?? delivery.Rental?.Product?.ProductImages?.FirstOrDefault()?.ImageUrl;

            return Ok(new
            {
                hasActive = true,
                delivery = new
                {
                    delivery.DeliveryId,
                    delivery.RentalId,
                    delivery.Status,
                    delivery.PickupAddress,
                    delivery.PickupLatitude,
                    delivery.PickupLongitude,
                    delivery.DropoffAddress,
                    delivery.DropoffLatitude,
                    delivery.DropoffLongitude,
                    delivery.DeliveryFee,
                    delivery.PickupOtp,
                    delivery.DropoffOtp,
                    delivery.ConditionPhotos,
                    delivery.CourierLatitude,
                    delivery.CourierLongitude,
                    Product = new
                    {
                        delivery.Rental?.Product?.ProductId,
                        delivery.Rental?.Product?.Title,
                        delivery.Rental?.Product?.PricePerDay,
                        PrimaryImage = primaryImg
                    },
                    Owner = new
                    {
                        delivery.Rental?.Owner?.UserId,
                        delivery.Rental?.Owner?.Username,
                        delivery.Rental?.Owner?.PhoneNo,
                        delivery.Rental?.Owner?.City
                    },
                    Renter = new
                    {
                        delivery.Rental?.Renter?.UserId,
                        delivery.Rental?.Renter?.Username,
                        delivery.Rental?.Renter?.PhoneNo,
                        delivery.Rental?.Renter?.City
                    },
                    Courier = new
                    {
                        delivery.Courier?.UserId,
                        delivery.Courier?.Username,
                        delivery.Courier?.PhoneNo,
                        delivery.Courier?.VehicleType,
                        delivery.Courier?.VehiclePlate
                    }
                }
            });
        }

        // =====================
        // GET DELIVERY BY ID
        // GET: api/deliveries/{id}
        // =====================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var delivery = await _context.Deliveries
                .Include(d => d.Rental)
                    .ThenInclude(r => r.Product)
                        .ThenInclude(p => p.ProductImages)
                .Include(d => d.Rental)
                    .ThenInclude(r => r.Owner)
                .Include(d => d.Rental)
                    .ThenInclude(r => r.Renter)
                .Include(d => d.Courier)
                .FirstOrDefaultAsync(d => d.DeliveryId == id);

            if (delivery == null)
                return NotFound(new { message = "Delivery not found!" });

            var primaryImg = delivery.Rental?.Product?.ProductImages?.FirstOrDefault(i => i.IsPrimary)?.ImageUrl 
                ?? delivery.Rental?.Product?.ProductImages?.FirstOrDefault()?.ImageUrl;

            return Ok(new
            {
                delivery.DeliveryId,
                delivery.RentalId,
                delivery.Status,
                delivery.PickupAddress,
                delivery.PickupLatitude,
                delivery.PickupLongitude,
                delivery.DropoffAddress,
                delivery.DropoffLatitude,
                delivery.DropoffLongitude,
                delivery.DeliveryFee,
                delivery.PickupOtp,
                delivery.DropoffOtp,
                delivery.ConditionPhotos,
                delivery.CourierLatitude,
                delivery.CourierLongitude,
                delivery.CreatedAt,
                delivery.PickedUpAt,
                delivery.DeliveredAt,
                Product = new
                {
                    delivery.Rental?.Product?.ProductId,
                    delivery.Rental?.Product?.Title,
                    delivery.Rental?.Product?.PricePerDay,
                    PrimaryImage = primaryImg
                },
                Owner = new
                {
                    delivery.Rental?.Owner?.UserId,
                    delivery.Rental?.Owner?.Username,
                    delivery.Rental?.Owner?.PhoneNo,
                    delivery.Rental?.Owner?.City
                },
                Renter = new
                {
                    delivery.Rental?.Renter?.UserId,
                    delivery.Rental?.Renter?.Username,
                    delivery.Rental?.Renter?.PhoneNo,
                    delivery.Rental?.Renter?.City
                },
                Courier = delivery.Courier != null ? new
                {
                    delivery.Courier.UserId,
                    delivery.Courier.Username,
                    delivery.Courier.PhoneNo,
                    delivery.Courier.VehicleType,
                    delivery.Courier.VehiclePlate,
                    delivery.Courier.AvgOwnerRating
                } : null
            });
        }

        // =====================
        // GET DELIVERY BY RENTAL ID (For Renter & Owner tracking)
        // GET: api/deliveries/by-rental/{rentalId}
        // =====================
        [HttpGet("by-rental/{rentalId}")]
        public async Task<IActionResult> GetByRental(int rentalId)
        {
            var delivery = await _context.Deliveries
                .Include(d => d.Rental)
                    .ThenInclude(r => r.Product)
                        .ThenInclude(p => p.ProductImages)
                .Include(d => d.Rental)
                    .ThenInclude(r => r.Owner)
                .Include(d => d.Rental)
                    .ThenInclude(r => r.Renter)
                .Include(d => d.Courier)
                .FirstOrDefaultAsync(d => d.RentalId == rentalId);

            if (delivery == null)
                return NotFound(new { message = "No delivery scheduled for this rental" });

            var primaryImg = delivery.Rental?.Product?.ProductImages?.FirstOrDefault(i => i.IsPrimary)?.ImageUrl 
                ?? delivery.Rental?.Product?.ProductImages?.FirstOrDefault()?.ImageUrl;

            return Ok(new
            {
                delivery.DeliveryId,
                delivery.RentalId,
                delivery.Status,
                delivery.PickupAddress,
                delivery.PickupLatitude,
                delivery.PickupLongitude,
                delivery.DropoffAddress,
                delivery.DropoffLatitude,
                delivery.DropoffLongitude,
                delivery.DeliveryFee,
                delivery.PickupOtp,
                delivery.DropoffOtp,
                delivery.ConditionPhotos,
                delivery.CourierLatitude,
                delivery.CourierLongitude,
                delivery.CreatedAt,
                delivery.PickedUpAt,
                delivery.DeliveredAt,
                Product = new
                {
                    delivery.Rental?.Product?.ProductId,
                    delivery.Rental?.Product?.Title,
                    delivery.Rental?.Product?.PricePerDay,
                    PrimaryImage = primaryImg
                },
                Owner = new
                {
                    delivery.Rental?.Owner?.UserId,
                    delivery.Rental?.Owner?.Username,
                    delivery.Rental?.Owner?.PhoneNo,
                    delivery.Rental?.Owner?.City
                },
                Renter = new
                {
                    delivery.Rental?.Renter?.UserId,
                    delivery.Rental?.Renter?.Username,
                    delivery.Rental?.Renter?.PhoneNo,
                    delivery.Rental?.Renter?.City
                },
                Courier = delivery.Courier != null ? new
                {
                    delivery.Courier.UserId,
                    delivery.Courier.Username,
                    delivery.Courier.PhoneNo,
                    delivery.Courier.VehicleType,
                    delivery.Courier.VehiclePlate,
                    delivery.Courier.AvgOwnerRating
                } : null
            });
        }

        // =====================
        // ACCEPT DELIVERY (By Courier)
        // POST: api/deliveries/{id}/accept
        // =====================
        [HttpPost("{id}/accept")]
        public async Task<IActionResult> AcceptDelivery(int id, [FromBody] AcceptDeliveryDto dto)
        {
            var delivery = await _context.Deliveries
                .Include(d => d.Rental)
                .FirstOrDefaultAsync(d => d.DeliveryId == id);

            if (delivery == null)
                return NotFound(new { message = "Delivery not found!" });

            if (delivery.Status != "Pending" || delivery.CourierId != null)
                return BadRequest(new { message = "This delivery has already been accepted by another courier." });

            var courier = await _context.Users.FindAsync(dto.CourierId);
            if (courier == null)
                return NotFound(new { message = "Courier user not found!" });

            delivery.CourierId = dto.CourierId;
            delivery.Status = "Assigned";

            // If OTPs not already generated, generate now
            if (string.IsNullOrEmpty(delivery.PickupOtp))
            {
                var rand = new Random();
                delivery.PickupOtp = rand.Next(1000, 9999).ToString();
            }
            if (string.IsNullOrEmpty(delivery.DropoffOtp))
            {
                var rand = new Random();
                delivery.DropoffOtp = rand.Next(1000, 9999).ToString();
            }

            // Also set initial courier location
            if (courier.CurrentLatitude.HasValue && courier.CurrentLongitude.HasValue)
            {
                delivery.CourierLatitude = courier.CurrentLatitude;
                delivery.CourierLongitude = courier.CurrentLongitude;
            }

            // Create notification for Owner
            _context.Notifications.Add(new Notification
            {
                UserId = delivery.Rental.OwnerId,
                ProductId = delivery.Rental.ProductId,
                Title = "Courier Assigned!",
                Message = $"Courier {courier.Username} has accepted your rental delivery and is heading for pickup.",
                Type = "Delivery",
                CreatedAt = DateTime.UtcNow
            });

            // Create notification for Renter
            _context.Notifications.Add(new Notification
            {
                UserId = delivery.Rental.RenterId,
                ProductId = delivery.Rental.ProductId,
                Title = "Courier on the way!",
                Message = $"Courier {courier.Username} is picking up your rental item.",
                Type = "Delivery",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Delivery accepted successfully!", status = "Assigned" });
        }

        // =====================
        // CONFIRM PICKUP (By Courier with Owner OTP & Condition Photos)
        // POST: api/deliveries/{id}/pickup
        // =====================
        [HttpPost("{id}/pickup")]
        public async Task<IActionResult> ConfirmPickup(int id, [FromBody] PickupDeliveryDto dto)
        {
            var delivery = await _context.Deliveries
                .Include(d => d.Rental)
                .Include(d => d.Courier)
                .FirstOrDefaultAsync(d => d.DeliveryId == id);

            if (delivery == null)
                return NotFound(new { message = "Delivery not found!" });

            if (delivery.Status != "Assigned" && delivery.Status != "HeadingToPickup")
                return BadRequest(new { message = "Delivery is not ready for pickup!" });

            // Validate Pickup OTP
            if (!string.Equals(delivery.PickupOtp?.Trim(), dto.PickupOtp?.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Invalid Pickup OTP! Ask owner for their 4-digit handover code." });
            }

            delivery.Status = "InTransit";
            delivery.PickedUpAt = DateTime.UtcNow;
            if (!string.IsNullOrEmpty(dto.ConditionPhotos))
            {
                delivery.ConditionPhotos = dto.ConditionPhotos;
            }

            // Update rental status to Active/Rented
            if (delivery.Rental != null)
            {
                delivery.Rental.Status = "Rented";
            }

            // Notify Renter
            _context.Notifications.Add(new Notification
            {
                UserId = delivery.Rental.RenterId,
                ProductId = delivery.Rental.ProductId,
                Title = "Item Picked Up!",
                Message = $"Courier {delivery.Courier?.Username} has picked up your item and is on the way to you.",
                Type = "Delivery",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Pickup verified! Item is now in transit.", status = "InTransit" });
        }

        // =====================
        // CONFIRM DROPOFF (By Courier with Renter OTP)
        // POST: api/deliveries/{id}/dropoff
        // =====================
        [HttpPost("{id}/dropoff")]
        public async Task<IActionResult> ConfirmDropoff(int id, [FromBody] DropoffDeliveryDto dto)
        {
            var delivery = await _context.Deliveries
                .Include(d => d.Rental)
                .Include(d => d.Courier)
                .FirstOrDefaultAsync(d => d.DeliveryId == id);

            if (delivery == null)
                return NotFound(new { message = "Delivery not found!" });

            if (delivery.Status != "InTransit" && delivery.Status != "PickedUp")
                return BadRequest(new { message = "Delivery is not in transit!" });

            // Validate Dropoff OTP
            if (!string.Equals(delivery.DropoffOtp?.Trim(), dto.DropoffOtp?.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Invalid Delivery OTP! Ask renter for their 4-digit delivery code." });
            }

            delivery.Status = "Delivered";
            delivery.DeliveredAt = DateTime.UtcNow;

            // Notify Owner
            _context.Notifications.Add(new Notification
            {
                UserId = delivery.Rental.OwnerId,
                ProductId = delivery.Rental.ProductId,
                Title = "Item Delivered!",
                Message = $"Your item has been safely delivered to the renter by {delivery.Courier?.Username}.",
                Type = "Delivery",
                CreatedAt = DateTime.UtcNow
            });

            // Notify Renter
            _context.Notifications.Add(new Notification
            {
                UserId = delivery.Rental.RenterId,
                ProductId = delivery.Rental.ProductId,
                Title = "Rental Delivered!",
                Message = "Your rental has been successfully delivered. Enjoy your product!",
                Type = "Delivery",
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = "Delivery confirmed! Item successfully handed over to renter.", status = "Delivered" });
        }

        // =====================
        // STREAM COURIER GPS LOCATION
        // POST: api/deliveries/{id}/location
        // =====================
        [HttpPost("{id}/location")]
        public async Task<IActionResult> UpdateLocation(int id, [FromBody] UpdateCourierLocationDto dto)
        {
            var delivery = await _context.Deliveries.FindAsync(id);
            if (delivery == null)
                return NotFound(new { message = "Delivery not found!" });

            delivery.CourierLatitude = dto.Latitude;
            delivery.CourierLongitude = dto.Longitude;

            if (delivery.CourierId.HasValue)
            {
                var courier = await _context.Users.FindAsync(delivery.CourierId.Value);
                if (courier != null)
                {
                    courier.CurrentLatitude = dto.Latitude;
                    courier.CurrentLongitude = dto.Longitude;
                    courier.LastLocationUpdated = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "GPS coordinates updated" });
        }

        // =====================
        // HAVERSINE DISTANCE HELPER
        // =====================
        private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // Earth radius in km
            var dLat = (lat2 - lat1) * Math.PI / 180.0;
            var dLon = (lon2 - lon1) * Math.PI / 180.0;
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(lat1 * Math.PI / 180.0) * Math.Cos(lat2 * Math.PI / 180.0) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }
    }
}
