using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SyncLove.Domain.Entities;
using SyncLove.Infrastructure.Identity;

namespace SyncLove.Infrastructure.Data;

/// <summary>
/// Application database context with Identity support.
/// </summary>
public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }
    
    /// <summary>Game sessions between couples.</summary>
    public DbSet<GameSession> GameSessions { get; set; }
    
    /// <summary>Refresh tokens for JWT authentication.</summary>
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // Rename Identity tables to cleaner names
        builder.Entity<ApplicationUser>().ToTable("Users");
        builder.Entity<IdentityRole<Guid>>().ToTable("Roles");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles");
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");
        
        // User-Partner self-referencing relationship (one-to-one)
        builder.Entity<ApplicationUser>()
            .HasOne(u => u.Partner)
            .WithOne()
            .HasForeignKey<ApplicationUser>(u => u.PartnerId)
            .OnDelete(DeleteBehavior.SetNull);
        
        // User-RefreshToken relationship
        builder.Entity<ApplicationUser>()
            .HasMany(u => u.RefreshTokens)
            .WithOne()
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // GameSession configuration
        builder.Entity<GameSession>(entity =>
        {
            entity.HasIndex(g => g.Status);
            entity.HasIndex(g => g.Player1Id);
            entity.HasIndex(g => g.Player2Id);
            
            entity.Property(g => g.GameType)
                .HasMaxLength(50)
                .IsRequired();
            
            entity.Property(g => g.GameState)
                .HasColumnType("jsonb");
        });
        
        // RefreshToken configuration
        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(rt => rt.Token).IsUnique();
            entity.Property(rt => rt.Token).HasMaxLength(500);
        });
    }
    
    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }
    
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }
    
    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries<BaseEntity>();
        var now = DateTime.UtcNow;
        
        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }
    }
}
