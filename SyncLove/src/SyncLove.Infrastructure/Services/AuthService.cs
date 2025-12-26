using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SyncLove.Application.Common;
using SyncLove.Application.DTOs.Auth;
using SyncLove.Application.Interfaces;
using SyncLove.Domain.Entities;
using SyncLove.Infrastructure.Data;
using SyncLove.Infrastructure.Identity;

namespace SyncLove.Infrastructure.Services;

/// <summary>
/// Authentication service implementation.
/// </summary>
public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _dbContext;
    private readonly IJwtTokenService _jwtService;
    
    public AuthService(
        UserManager<ApplicationUser> userManager,
        AppDbContext dbContext,
        IJwtTokenService jwtService)
    {
        _userManager = userManager;
        _dbContext = dbContext;
        _jwtService = jwtService;
    }
    
    public async Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        // Check if email already exists
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return Result<AuthResponse>.Failure("Email is already registered.", "EMAIL_EXISTS");
        }
        
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            DisplayName = request.DisplayName,
            CreatedAt = DateTime.UtcNow
        };
        
        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Result<AuthResponse>.Failure(errors, "REGISTRATION_FAILED");
        }
        
        return await GenerateAuthResponseAsync(user);
    }
    
    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return Result<AuthResponse>.Failure("Invalid email or password.", "INVALID_CREDENTIALS");
        }
        
        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
        {
            return Result<AuthResponse>.Failure("Invalid email or password.", "INVALID_CREDENTIALS");
        }
        
        // Update last online
        user.LastOnlineAt = DateTime.UtcNow;
        user.IsOnline = true;
        await _userManager.UpdateAsync(user);
        
        return await GenerateAuthResponseAsync(user);
    }
    
    public async Task<Result<AuthResponse>> RefreshTokenAsync(string refreshToken, string? ipAddress = null)
    {
        var user = await _dbContext.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.RefreshTokens.Any(rt => rt.Token == refreshToken));
        
        if (user == null)
        {
            return Result<AuthResponse>.Failure("Invalid refresh token.", "INVALID_TOKEN");
        }
        
        var existingToken = user.RefreshTokens.First(rt => rt.Token == refreshToken);
        
        if (!existingToken.IsActive)
        {
            return Result<AuthResponse>.Failure("Token has expired or been revoked.", "TOKEN_EXPIRED");
        }
        
        // Rotate refresh token
        existingToken.IsRevoked = true;
        existingToken.RevokedAt = DateTime.UtcNow;
        existingToken.RevokedByIp = ipAddress;
        
        var newRefreshToken = CreateRefreshToken(ipAddress);
        existingToken.ReplacedByToken = newRefreshToken.Token;
        
        user.RefreshTokens.Add(newRefreshToken);
        await _dbContext.SaveChangesAsync();
        
        var accessToken = _jwtService.GenerateAccessToken(user.Id, user.Email!);
        
        return Result<AuthResponse>.Success(new AuthResponse(
            user.Id,
            user.Email!,
            user.DisplayName,
            user.AvatarUrl,
            accessToken,
            newRefreshToken.Token,
            _jwtService.GetAccessTokenExpiration()
        ));
    }
    
    public async Task<Result> RevokeTokenAsync(string refreshToken, string? ipAddress = null)
    {
        var user = await _dbContext.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.RefreshTokens.Any(rt => rt.Token == refreshToken));
        
        if (user == null)
        {
            return Result.Failure("Invalid refresh token.", "INVALID_TOKEN");
        }
        
        var token = user.RefreshTokens.First(rt => rt.Token == refreshToken);
        
        if (!token.IsActive)
        {
            return Result.Failure("Token is already revoked.", "TOKEN_REVOKED");
        }
        
        token.IsRevoked = true;
        token.RevokedAt = DateTime.UtcNow;
        token.RevokedByIp = ipAddress;
        
        await _dbContext.SaveChangesAsync();
        
        return Result.Success();
    }
    
    public async Task<Result<UserDto>> GetCurrentUserAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return Result<UserDto>.Failure("User not found.", "USER_NOT_FOUND");
        }
        
        return Result<UserDto>.Success(new UserDto(
            user.Id,
            user.Email!,
            user.DisplayName,
            user.AvatarUrl,
            user.PartnerId,
            user.IsOnline,
            user.LastOnlineAt
        ));
    }
    
    private async Task<Result<AuthResponse>> GenerateAuthResponseAsync(ApplicationUser user, string? ipAddress = null)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _jwtService.GenerateAccessToken(user.Id, user.Email!, roles);
        
        var refreshToken = CreateRefreshToken(ipAddress);
        user.RefreshTokens.Add(refreshToken);
        
        // Clean up old tokens (keep only last 5)
        var oldTokens = user.RefreshTokens
            .Where(rt => !rt.IsActive)
            .OrderByDescending(rt => rt.CreatedAt)
            .Skip(5)
            .ToList();
        
        foreach (var token in oldTokens)
        {
            user.RefreshTokens.Remove(token);
        }
        
        await _dbContext.SaveChangesAsync();
        
        return Result<AuthResponse>.Success(new AuthResponse(
            user.Id,
            user.Email!,
            user.DisplayName,
            user.AvatarUrl,
            accessToken,
            refreshToken.Token,
            _jwtService.GetAccessTokenExpiration()
        ));
    }
    
    private RefreshToken CreateRefreshToken(string? ipAddress = null)
    {
        return new RefreshToken
        {
            Token = _jwtService.GenerateRefreshToken(),
            ExpiresAt = _jwtService.GetRefreshTokenExpiration(),
            CreatedByIp = ipAddress
        };
    }
}
