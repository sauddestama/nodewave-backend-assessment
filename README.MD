# NodeWave Backend Assessment

Complete TypeScript backend API with JWT authentication, Excel processing, and FilterQueryV2 integration.

## Quick Start

### Prerequisites
- Node.js >= 16.x
- MySQL database (Docker recommended)
- Postman for API testing

### Installation
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start development server
npx ts-node src/index.ts --service=rest
```

## API Documentation

### Authentication Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication (returns JWT token)

### File Management Endpoints (Protected)

- `POST /files/upload` - Upload Excel/CSV files
- `GET /files` - List files with FilterQueryV2 support
- `GET /files/:id` - Get file details with processed data
- `DELETE /files/:id` - Delete file and related data

## FilterQueryV2 Integration

This API supports NodeWave's advanced filtering system:

### Query Parameters

- `filters` - JSON object for exact matches
- `searchFilters` - JSON object for partial/contains searches
- `rangedFilters` - Array for range filtering
- `page` - Page number (default: 1)
- `rows` - Items per page (default: 10)
- `orderKey` - Sort field (default: createdAt)
- `orderRule` - Sort direction: asc/desc (default: desc)

### Examples

```bash
# Filter by status
GET /files?filters={"status":"completed"}

# Search by filename
GET /files?searchFilters={"originalName":"sample"}

# Range filter by file size
GET /files?rangedFilters=[{"key":"size","start":1000,"end":100000}]

# Combined filtering with pagination
GET /files?filters={"status":"completed"}&searchFilters={"originalName":"karyawan"}&page=2&rows=5&orderKey=createdAt&orderRule=asc
```

## Testing with Postman

### Import Collection:

1. Import `postman/NodeWave-Assessment-API.postman_collection.json`
2. Import `postman/NodeWave-Assessment.postman_environment.json`

### Authentication:

1. Run `POST /auth/register` to create account
2. Run `POST /auth/login` (token auto-saved to environment)

### File Upload Testing:

Use Indonesian data files from `test-data/` folder:

- `sample-karyawan.xlsx` - Employee data from Indonesian tech companies
- `sample-startup.xlsx` - Indonesian startup ecosystem data
- `data-perusahaan-besar.xlsx` - Large Indonesian corporate dataset

1. Upload via `POST /files/upload`
2. Check background processing status

### FilterQueryV2 Testing:

1. Test all filtering combinations
2. Verify pagination and sorting
3. Check response format compliance

## 🇮🇩 Test Data

Test files contain realistic Indonesian data:

- **Tech Companies**: Tokopedia, Gojek, Shopee, Traveloka, etc.
- **Startups**: Ajaib, Modalku, Kredivo, Flip, Xendit, etc.
- **Corporates**: BCA, BRI, Mandiri, Telkom, Pertamina, etc.
- **Indonesian Names**: Proper Indonesian naming conventions
- **Email Formats**: Company-specific email domains
- **Phone Numbers**: Indonesian mobile format (+62-xxx-xxxx-xxxx)

## Technical Architecture

### Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT tokens
- **File Processing**: xlsx library with background jobs
- **Filtering**: NodeWave FilterQueryV2 system

### Database Schema

- **Users**: Authentication and user management
- **FileUploads**: File metadata and processing status
- **SampleData**: Parsed Excel/CSV data storage

### Background Processing

- Asynchronous file processing
- Status tracking: pending → processing → completed/failed
- Error handling and logging

## Project Structure

```
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── middleware/      # Authentication & validation
│   ├── routes/          # API routes
│   └── utils/           # Helper functions
├── prisma/              # Database schema and migrations
├── postman/             # API testing collection
├── test-data/           # Sample Indonesian data files
└── uploads/             # File storage (gitignored)
```

## Security Features

- JWT authentication for all protected routes
- File type validation (Excel/CSV only)
- User isolation (users only see their own files)  
- Input validation and sanitization
- Error handling without sensitive data exposure

## API Response Format

All API responses follow a consistent format:

```json
{
  "content": { /* response data */ },
  "message": "Success message",
  "errors": []
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Development Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run migrate    # Run database migrations
npm run seed      # Seed database with sample data
npm run studio    # Open Prisma Studio
```

## FilterQueryV2 Advanced Examples

### Multiple Status Filter
```bash
GET /files?filters={"status":["completed","processing"]}
```

### Date Range Filter
```bash
GET /files?rangedFilters=[{"key":"createdAt","start":"2024-01-01","end":"2024-12-31"}]
```

### Complex Search with Pagination
```bash
GET /files?searchFilters={"originalName":"karyawan","user.fullName":"Budi"}&page=1&rows=20&orderKey=size&orderRule=desc
```

### Company Filter (Relational)
```bash
GET /files?searchFilters={"sampleData.company":"Tokopedia"}
```

## Environment Variables

```env
DATABASE_URL="mysql://user:password@localhost:3306/database"
SHADOW_DATABASE_URL="mysql://user:password@localhost:3306/database_shadow"  
NODE_LOCAL_PORT=3010
JWT_SECRET="your-jwt-secret-key"
ENVIRONMENT=dev
ALLOWED_ORIGINS="*"
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check DATABASE_URL in .env
   - Run `npx prisma migrate dev`

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration (24h default)
   - Re-login to get fresh token

3. **File Upload Issues**
   - Ensure uploads/ directory exists
   - Check file type (Excel/CSV only)
   - Verify file size limits (10MB max)

4. **FilterQueryV2 Parsing**
   - Ensure JSON parameters are properly encoded
   - Check query string format
   - Validate date formats for range filters

## License

This project is part of the NodeWave Backend Assessment.

---

**Built for NodeWave Backend Assessment** 🇮🇩

## Creating new features / endpoint

- Branch out from develop
```
git checkout -b <branch_name>
```
- Create a new schema (if needed) on prisma/schema.prisma

- Migrate the schema with :
```
npx prisma migrate --name <migration_name>
```

- Create new entity on `/entities` folder

- Create validation for that entities (for create and update if any) on `/validations` folder

- Create the service layer on /services

- Link it into controller in /controllers

- Create new routes file instance at /routes, for example `ProductRoutes.ts`

- Register the routes into registry (`routes/registry.ts`)

- use the routes, with router.use(), for example :

  ```js
  router.use("/products", RoutesRegistry.productRoutes);
  ```

- Test in postman and document it with example


## Folder Structures Brief Explanation 

#### Apps and Servers 

- `/app` 

  This contains app inilization for different communication protocol, files inside this directory is responsible to starting up the communcation protocol based server

  Default app is rest, if you want to add more , you can add it by naming it something like `<protocol>.ts` , e.g. : `grpc.ts` , add it to instance.ts 

- `/server` 
  
  This contains server initialization for different communication 
  protocol server, file inside this directory will responsible to hold the configuration needed, like the the server initialization, dependencies for this communcation protocol etc. 

  if you want to add more , you can add it by naming it something like `<protocol>.ts` , e.g. : `grpc.ts` , add it to the instance.ts 

> [!IMPORTANT]  
> After you add both app and server, configure it to be receivable my the command line argument, by adding the app function and argument into the if condition inside `src/index.ts`

#### Entities 

- `/entity` 

  Files inside this directory, will hold various `interfaces` or `types`, needed for data transfer and access (DTOs and DAOs), in this directory, we follow the Domain-Driven pattern, where it will easily transalates to each domain means each table on db. 

  Or maybe in other case, you can also specify global types that is used everywhere in the code, like `Service.ts` that we currently have and `Query.ts` entities, this means to hold all types related to service responses and dynamic query arguments and also pagination result.


#### Packages and Utils

- `/pkg` 

  This dir is simple, you categorize 3rd party integration inside of this dir, you can also define types spesific to this 3rd party inside here, so the common practice is something like : 
  ```
    - pkg 
        - package name 
            - index.ts -> package instance (use singleton if possible please)
            - interfaces.ts -> for package spesific typing 
            - utils.ts  -> for utility functions
            - ... methodspecific.ts -> for specific sub-functionality, e.g: coreAPI.ts in midtrans pkg only holds functions needed to do payment through midtrans's Core API
  ```

  We make it in this structure so it will be clear that all of this belongs to specific 3rd party.

- `/utils` 

  This dir will holds utility function that are needed for helpers globally, like string manipulation, dates manipulation etc 

 
#### Controllers and Services 

 - `/controllers` 
  Here, we also follow domain based filenaming, so each domain will have 1 controller, with the responsibility in controller, only limited to 
    - Retrieve and parse the request.
    - Call service function 
    - Return the response.


 - `/services`

  Here, we also follow domain based file naming, each domain will have 1 services, and maybe 1 helper service if needed, with the responsibility in service is only to do business logics, calling the db (we don't use repository since prisma orm is already more or less like a repository in it's nature). Please never mix up 3rd party integration here, as we already have the package for that, unless the 3rd party will also have controllers (like midtrans callback).


#### Routes, Validations and Middlewares

- `/routes` 

  This folders mainly has 3 parts 
  1. Domain based files ( e.g. : `ProductRoutes.ts` ), will contains all of the routings by domain 
  2. `RoutesRegistry.ts`, we pool all the routes exports here 
  3. index.ts -> we attach all the routes, pooled from `RoutesRegistry.ts` here

- `/validations` 

  Domain based, serve as a middleware, contains validation for any operation that involves sending request body, normally you will create the validation here,
  and use it on routes as a `middleware`.
 
  > [!WARNING]  
  > Don't use validation function inside controllers because it will cause an error if you do so.


- `/middlewares` 

  Here contains middlewares that can be used in the `/server/` directory or that can be used globally inside many routes, for example we have 
  `authMiddleware` for JWT authentication, `morganMiddleware` for http logging.