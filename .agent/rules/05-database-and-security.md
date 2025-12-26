# 05 - Database & Security

## Purpose
To ensure data security, integrity, and access control (Authorization).

## Firestore Security Rules (If Firebase is used)
Database rules start with the "deny-all" principle by default.

```javascript
rules_version = "2";
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // User profiles: Everyone can read, only owner can write
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isOwner(userId);
    }

    // Game rooms: Only players in the room can write
    match /games/{gameId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn() 
                    && (request.resource.data.player1Id == request.auth.uid 
                    || request.resource.data.player2Id == request.auth.uid);
    }
  }
}
```

## SQL / PostgreSQL Standards (If .NET is used)

* **Primary Keys:** Use `UUID` or `GUID` (better than int ID for distributed systems).
* **Indexing:** Add indexes to Foreign Key columns and frequently queried fields (`IsActive`, `GameStatus`) for query performance.
* **Soft Delete:** Do not delete data, use `is_deleted` or `deleted_at` column.

## Secrets Management

* Never push `.env` files to git.
* Use Azure Key Vault, AWS Secrets Manager, or Doppler in production.
* Do not store API Keys on the client side (React); use a Proxy endpoint.
