
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
    public DbSet<Wishlist> Wishlists { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Delivery> Deliveries { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Delivery <-> Rental (1-to-1)
        modelBuilder.Entity<Delivery>()
            .HasOne(d => d.Rental)
            .WithOne(r => r.Delivery)
            .HasForeignKey<Delivery>(d => d.RentalId)
            .OnDelete(DeleteBehavior.Cascade);

        // Delivery <-> Courier (User)
        modelBuilder.Entity<Delivery>()
            .HasOne(d => d.Courier)
            .WithMany()
            .HasForeignKey(d => d.CourierId)
            .OnDelete(DeleteBehavior.Restrict);

        // Product <-> Category (Main Category)
        modelBuilder.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Product <-> SubCategory
        modelBuilder.Entity<Product>()
            .HasOne(p => p.SubCategory)
            .WithMany()
            .HasForeignKey(p => p.SubCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Category hierarchy (Parent <-> Children)
        modelBuilder.Entity<Category>()
            .HasOne(c => c.ParentCategory)
            .WithMany(c => c.SubCategories)
            .HasForeignKey(c => c.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Wishlist
        modelBuilder.Entity<Wishlist>()
            .HasIndex(w => new { w.UserId, w.ProductId })
            .IsUnique();

        modelBuilder.Entity<Wishlist>()
            .HasOne(w => w.User)
            .WithMany()
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Wishlist>()
            .HasOne(w => w.Product)
            .WithMany()
            .HasForeignKey(w => w.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // Notification
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.Product)
            .WithMany()
            .HasForeignKey(n => n.ProductId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}