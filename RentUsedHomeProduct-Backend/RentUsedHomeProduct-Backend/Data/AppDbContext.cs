
using Microsoft.EntityFrameworkCore;
using RentUsedHomeProduct_Backend.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Rental> Rentals { get; set; }
    public DbSet<CategoryAttribute> CategoryAttributes { get; set; }
    public DbSet<ProductAttributeValue> Product_Attribute_Values { get; set; }
    public DbSet<ProductImage> ProductImages { get; set; }
}