# Setup Instructions for Listing System

## Environment Variables

Add the following to your `.env.local` file:

```env
# Google Maps API Key (required for location picker)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# AWS S3 Configuration (already configured)
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name
PUBLIC_CDN_URL=your_cdn_url (optional)
```

## Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain (recommended for production)
6. Add the API key to your `.env.local` file as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Features Implemented

### 1. Sortable Image Uploader (`SortableImageUploader.tsx`)
- Drag-and-drop image upload to S3
- Drag-and-drop reordering of images
- First image automatically becomes primary
- Visual indicators for primary image
- Progress tracking during upload
- Delete functionality

### 2. Google Maps Location Picker (`GoogleMapsLocationPicker.tsx`)
- Interactive map with click-to-select
- Search autocomplete for locations
- Draggable marker for precise location
- Reverse geocoding to get address details
- Extracts country, state, city, area, and coordinates
- Formatted address display

### 3. Listing Form (`ListingForm.tsx`)
- Complete form for creating/editing listings
- Category selection
- Location picker integration
- Sortable image uploader
- All required fields with validation
- Admin vs User mode (admin can set status)

### 4. Listings Table (`ListingsTable.tsx`)
- Sortable columns
- Pagination
- Image preview
- Status and condition badges
- Actions dropdown (View, Edit, Delete)
- Responsive design

### 5. Admin Listings Page (`/admin/listings`)
- Full CRUD operations
- Search functionality
- Filtering and sorting
- Create/Edit/Delete listings
- View all listings with user information

### 6. User Listings Page (`/user/listings`)
- View only own listings
- Create/Edit/Delete own listings
- Same interface as admin but filtered by user

## Usage

### Admin Panel
- Navigate to `/admin/listings`
- Click "Add Listing" to create new listing
- Use search to find listings
- Click actions menu (three dots) to view/edit/delete

### User Dashboard
- Navigate to `/user/listings`
- Click "Create Listing" to create new listing
- Manage your own listings
- All listings are automatically filtered to current user

## API Endpoints

### GET /api/listings
Enhanced with multiple filters:
- `q` - Search query
- `categoryId` / `categoryIds` - Category filter(s)
- `condition` / `conditions` - Condition filter(s)
- `currency` / `currencies` - Currency filter(s)
- `minPrice` / `maxPrice` - Price range
- `country`, `state`, `city`, `area` - Location filters
- `lat`, `lng`, `radius` - Location-based search
- `sortByDistance` - Sort by distance
- `isPhoneVisible` - Phone visibility filter
- `negotiable` - Negotiable filter
- `status` - Status filter (defaults to ACTIVE)

### POST /api/listings
- Creates new listing
- Requires authentication
- Validates plan for non-admin users
- Uses S3 presigned URLs for images

### PATCH /api/listings/[id]
- Updates existing listing
- Requires authentication
- Validates plan for non-admin users
- Uses S3 presigned URLs for images

### DELETE /api/listings/[id]
- Deletes listing (soft delete)
- Requires authentication

## Image Upload Flow

1. User selects images in `SortableImageUploader`
2. Component calls `/api/uploads/sign` to get presigned POST URL
3. Images uploaded directly to S3
4. Component stores S3 URLs in state
5. On form submit, URLs are sent to listing API
6. Listing service stores URLs in database

## Location Flow

1. User searches or clicks on map in `GoogleMapsLocationPicker`
2. Google Maps API provides location details
3. Component extracts: country, state, city, area, lat, lng
4. On form submit, location object is sent to listing API
5. Listing service creates Location record if needed
6. Location ID is stored with listing

## Notes

- All images are stored in S3 using presigned URLs
- Location data is stored in Location table and referenced by listing
- Plan validation is applied for non-admin users
- Admin users bypass all plan checks
- User listings page automatically filters by current user ID

