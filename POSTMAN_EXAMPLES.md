# Listing API - Postman Examples

This document provides example payloads for the Listing API endpoints with location details.

## Environment Variables

Set these variables in Postman:
- `base_url`: Your API base URL (e.g., `http://localhost:3000`)
- `auth_token`: Your authentication token (Bearer token)
- `admin_auth_token`: Admin authentication token (for admin operations)
- `listing_id`: Listing ID for update/delete operations

## Authentication

All requests require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer {{auth_token}}
```

---

## POST /api/listings - Create Listing

### Option 1: Create with Location Object (Full Details)

```json
{
  "categoryId": 1,
  "location": {
    "country": "PK",
    "state": "Punjab",
    "city": "Lahore",
    "area": "Gulberg",
    "lat": 31.5204,
    "lng": 74.3587
  },
  "title": "Brand New iPhone 15 Pro Max",
  "description": "Unopened iPhone 15 Pro Max 256GB in Natural Titanium. Still sealed in box with all accessories.",
  "price": 350000,
  "currency": "PKR",
  "condition": "NEW",
  "negotiable": true,
  "status": "DRAFT",
  "isPhoneVisible": true,
  "images": [
    {
      "url": "https://example.com/images/iphone1.jpg",
      "sortOrder": 0,
      "isPrimary": true
    },
    {
      "url": "https://example.com/images/iphone2.jpg",
      "sortOrder": 1,
      "isPrimary": false
    }
  ],
  "attributes": {
    "brand": "Apple",
    "model": "iPhone 15 Pro Max",
    "storage": "256GB",
    "color": "Natural Titanium"
  }
}
```

### Option 2: Create with Location ID

```json
{
  "categoryId": 1,
  "locationId": 5,
  "title": "Samsung Galaxy S24 Ultra",
  "description": "Excellent condition Samsung Galaxy S24 Ultra 512GB. Used for 2 months only.",
  "price": 280000,
  "currency": "PKR",
  "condition": "LIKE_NEW",
  "negotiable": false,
  "status": "DRAFT",
  "isPhoneVisible": true,
  "images": [
    {
      "url": "https://example.com/images/samsung1.jpg",
      "sortOrder": 0,
      "isPrimary": true
    }
  ]
}
```

### Option 3: Create with Minimal Location (Only Required Fields)

```json
{
  "categoryId": 2,
  "location": {
    "country": "PK",
    "city": "Karachi"
  },
  "title": "MacBook Pro M3",
  "description": "MacBook Pro 14-inch with M3 chip, 16GB RAM, 512GB SSD",
  "price": 450000,
  "currency": "PKR",
  "condition": "USED",
  "negotiable": true,
  "status": "DRAFT",
  "isPhoneVisible": true,
  "images": []
}
```

### Location Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `country` | string | Yes | ISO2 country code (2 characters, e.g., "PK", "US") |
| `state` | string | No | State/Province name (max 100 characters) |
| `city` | string | Yes | City name (1-120 characters) |
| `area` | string | No | Area/Neighborhood name (max 120 characters) |
| `lat` | number | No | Latitude coordinate |
| `lng` | number | No | Longitude coordinate |

**Note:** You can use either `location` object OR `locationId`, but not both. If both are provided, `location` object takes precedence.

---

## PATCH /api/listings/{id} - Update Listing

### Option 1: Update with Location Object

```json
{
  "location": {
    "country": "PK",
    "state": "Sindh",
    "city": "Karachi",
    "area": "Clifton",
    "lat": 24.8138,
    "lng": 67.0225
  },
  "title": "Updated Title - iPhone 15 Pro Max",
  "price": 340000,
  "status": "ACTIVE"
}
```

### Option 2: Update with Location ID

```json
{
  "locationId": 10,
  "title": "Updated Listing Title",
  "description": "Updated description here",
  "price": 300000
}
```

### Option 3: Remove Location

```json
{
  "location": null,
  "title": "Listing without location"
}
```

### Option 4: Update Only Location (Keep Other Fields)

```json
{
  "location": {
    "country": "PK",
    "city": "Islamabad",
    "area": "F-7"
  }
}
```

---

## Admin Operations

### Admin Create Listing for Specific User

Admins can create listings for any user by providing `userId` in the payload:

```json
{
  "userId": 2,
  "categoryId": 1,
  "location": {
    "country": "PK",
    "state": "Khyber Pakhtunkhwa",
    "city": "Peshawar",
    "area": "University Town",
    "lat": 34.0151,
    "lng": 71.5249
  },
  "title": "Admin Created Listing",
  "description": "This listing was created by admin for user ID 2",
  "price": 150000,
  "currency": "PKR",
  "condition": "USED",
  "negotiable": true,
  "status": "ACTIVE",
  "isPhoneVisible": true,
  "images": []
}
```

**Note:** Admin users bypass plan checks and can set status to ACTIVE without subscription validation.

---

## Status Values

- `DRAFT` - Draft listing (default)
- `PENDING` - Pending approval
- `ACTIVE` - Active/Published listing
- `PAUSED` - Temporarily paused
- `SOLD` - Item sold
- `EXPIRED` - Listing expired
- `REJECTED` - Rejected by admin
- `ARCHIVED` - Archived listing

## Condition Values

- `NEW` - Brand new, unused
- `LIKE_NEW` - Like new condition
- `USED` - Used condition
- `FOR_PARTS` - For parts/repair only

## Currency Values

- `PKR` - Pakistani Rupee (default)
- `USD` - US Dollar
- `EUR` - Euro
- `GBP` - British Pound
- `AED` - UAE Dirham
- `INR` - Indian Rupee

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized. Please login to create listings.",
  "code": "UNAUTHORIZED"
}
```

### 403 Forbidden (Plan Related)
```json
{
  "success": false,
  "message": "No active subscription found. Please subscribe to a plan to create listings."
}
```

### 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "message": "Country must be ISO2 code (2 characters)"
}
```

---

## Important Notes

1. **Authentication Required**: All create/update operations require a valid authentication token.

2. **Plan Validation**: 
   - Regular users must have an active subscription to create/activate listings
   - Admin users bypass all plan checks
   - Plan checks apply when status is set to `ACTIVE`

3. **Location Handling**:
   - Use `location` object to create a new location
   - Use `locationId` to reference an existing location
   - Set `location: null` to remove location from listing
   - If both `location` and `locationId` are provided, `location` object takes precedence

4. **User ID**:
   - Regular users: `userId` is automatically set from token (cannot override)
   - Admin users: Can specify `userId` in payload to create listings for other users

5. **Quota Management**:
   - Quota is decremented when listing status changes to `ACTIVE`
   - Quota is checked before allowing status change to `ACTIVE`
   - Admin users don't consume quota

