# Listing API Enhancements - OLX-Style Features

## Overview
The listing API has been enhanced with comprehensive filtering capabilities similar to OLX, including location-based search, multiple filter combinations, and optimized queries.

## New Features

### 1. Enhanced Search
- **Full-text search** across title, description, category name, city, and area
- **Case-insensitive** search for better user experience
- Searches in multiple fields simultaneously

### 2. Multiple Filter Support

#### Category Filters
- Single category: `categoryId=1`
- Multiple categories: `categoryIds=1,2,3`

#### Condition Filters
- Single condition: `condition=NEW`
- Multiple conditions: `conditions=NEW,LIKE_NEW,USED`

#### Currency Filters
- Single currency: `currency=PKR`
- Multiple currencies: `currencies=PKR,USD,EUR`

#### Location Filters
- By location ID: `locationId=5`
- By country: `country=PK` (ISO2 code)
- By state: `state=Punjab`
- By city: `city=Lahore`
- By area: `area=Gulberg`
- **All location filters can be combined**

#### Price Range
- Minimum price: `minPrice=1000`
- Maximum price: `maxPrice=50000`
- Both can be used together

#### Other Filters
- Phone visibility: `isPhoneVisible=true`
- Negotiable: `negotiable=true`
- User listings: `userId=1`
- Status: `status=ACTIVE` (defaults to ACTIVE if not specified)

### 3. Location-Based Search (Nearest to User)

#### Features
- **Distance calculation** using Haversine formula
- **Radius filtering** (default: 50km)
- **Sort by distance** option

#### Parameters
- `lat`: User's latitude (-90 to 90)
- `lng`: User's longitude (-180 to 180)
- `radius`: Search radius in kilometers (0-1000, default: 50)
- `sortByDistance`: Sort results by distance (true/false, default: false)

#### Example
```
GET /api/listings?lat=31.5204&lng=74.3587&radius=25&sortByDistance=true
```

This will:
1. Find all listings within 25km of the specified coordinates
2. Calculate distance for each listing
3. Sort results by distance (nearest first)
4. Include distance in response

### 4. Default Behavior
- **Status filter**: Defaults to `ACTIVE` if not specified (shows only active listings)
- **Pagination**: Default page size is 20, max 100
- **Sorting**: Defaults to `createdAt:desc` (newest first)

## API Examples

### Basic Search
```
GET /api/listings?q=iphone
```

### Multiple Filters Combined
```
GET /api/listings?q=phone&categoryIds=1,2&minPrice=10000&maxPrice=100000&currency=PKR&city=Lahore&isPhoneVisible=true
```

### Location-Based Search
```
GET /api/listings?lat=31.5204&lng=74.3587&radius=30&sortByDistance=true&categoryId=1
```

### Complex Search with All Filters
```
GET /api/listings?q=samsung&categoryIds=1,2&conditions=NEW,LIKE_NEW&currencies=PKR,USD&minPrice=20000&maxPrice=150000&country=PK&state=Punjab&city=Lahore&area=Gulberg&lat=31.5204&lng=74.3587&radius=50&sortByDistance=true&isPhoneVisible=true&negotiable=true&page=1&pageSize=20&sort=price:asc
```

## Response Format

### Standard Response
```json
{
  "success": true,
  "data": {
    "pagination": {
      "total": 150,
      "page": 1,
      "pageSize": 20,
      "totalPages": 8
    },
    "items": [
      {
        "id": 1,
        "title": "iPhone 15 Pro Max",
        "price": 350000,
        "currency": "PKR",
        "condition": "NEW",
        "location": {
          "country": "PK",
          "state": "Punjab",
          "city": "Lahore",
          "area": "Gulberg",
          "lat": "31.5204",
          "lng": "74.3587"
        },
        "distance": 2.5,  // Only included if lat/lng provided
        "category": { ... },
        "user": { ... },
        "images": [ ... ],
        "_count": {
          "favorites": 5,
          "threads": 2
        }
      }
    ],
    "filters": {
      "hasLocationFilter": true,
      "radius": 50
    },
    "q": "iphone",
    "sort": "createdAt:desc"
  }
}
```

## Sort Options

Available sort fields:
- `id` - Listing ID
- `title` - Title (alphabetical)
- `slug` - Slug
- `price` - Price (ascending/descending)
- `createdAt` - Creation date
- `updatedAt` - Update date
- `publishedAt` - Publication date
- `viewsCount` - View count
- `favoritesCount` - Favorite count
- `status` - Status

### Sort Format
- Single: `sort=price:asc`
- Multiple: `sort=price:asc,createdAt:desc`

## Performance Optimizations

1. **Database Indexing**: Queries use existing indexes on:
   - `status`, `publishedAt`
   - `categoryId`, `status`
   - `location` (country, state, city)
   - `location` (lat, lng)

2. **Efficient Filtering**: All filters are applied at database level before pagination

3. **Parallel Queries**: Count and data fetching run in parallel

4. **Distance Calculation**: Only calculated when location-based search is used

## Migration Notes

### Breaking Changes
- **Status default**: Now defaults to `ACTIVE` instead of showing all statuses
  - To see all listings: `?status=` (empty) or specify status explicitly

### New Query Parameters
All new parameters are optional and backward compatible.

## Best Practices

1. **Use location filters** for better relevance
2. **Combine filters** to narrow down results
3. **Use `sortByDistance=true`** when searching by location
4. **Set appropriate radius** based on your use case (default 50km)
5. **Use pagination** for large result sets

## Error Handling

All validation errors return user-friendly messages:
- Invalid parameters: Clear error messages
- Missing required fields: Specific field names
- Type mismatches: Helpful conversion hints

