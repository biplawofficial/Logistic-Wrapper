Base URL: https://<HOST>:<PORT>/api/v1
All JSON request/response examples use application/json unless otherwise noted.

Authentication & Common
Headers (where required)

Authorization: Bearer <JWT_TOKEN> — required for routes protected by Authenticate.

Content-Type: application/json — for JSON bodies.

Authentication middleware behavior

Authenticate verifies JWT (secret JWT_SECRET) and sets req.user to the User document (no pwdhash).

Authorize([...roles]) checks req.user's role against allowed roles; returns 403 when unauthorized.

Common status codes

200 OK — successful GET/PATCH/POST (non-creation).

201 Created — resource created.

400 Bad Request — missing/invalid inputs.

401 Unauthorized — missing/invalid token or login failure.

403 Forbidden — role not allowed (authorization).

404 Not Found — resource not present.

409 Conflict — duplicate resource / token mismatch.

500 Internal Server Error — unexpected server error.

1. Login

Endpoint

POST /api/v1/login


Purpose
Authenticate user and return a JWT token (1h expiry).

Request body

{
  "email": "user@example.com",
  "password": "plaintextPassword"
}


Success response (200)

{
  "message": "User Logged In Successfully!",
  "token": "<JWT_TOKEN>"
}


Errors

400 — missing email/password.

401 — invalid credentials.

500 — server error.

2. Fetch current user details

Endpoint

GET /api/v1/fetchdetail


Auth

Header: Authorization: Bearer <JWT_TOKEN>

Allowed roles: user, admin, logistic

Purpose
Return the authenticated user's User document and role-specific details document.

Success response (200)

{
  "message": "User Details Fetched Successfully!",
  "user": {
    "_id": "64c...abcd",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "user",
    "createdAt": "2025-12-11T09:12:34.000Z"
  },
  "details": {
    /* role-specific document (UserDetails | AdminDetails | LogisticDetails) */
  }
}


Errors

401 — missing/invalid token.

400 — invalid role.

404 — user not found.

500 — server error.

3. User routes (/api/v1/user)
3.1 Register user
POST /api/v1/user/register


Request

{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "strongPassword"
}


Success (201)

{
  "message": "User Registered Successfully!",
  "response": {
    "_id": "64c...abcd",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "user",
    "createdAt": "2025-12-11T09:12:34.000Z"
  }
}


Errors

400 missing fields

409 email already exists

3.2 Update user details (role: user)
PATCH /api/v1/user/update/:id


Auth

Authenticate + Authorize(["user"])

Path params

:id — user _id (Mongo ObjectId)

Allowed body fields

{
  "name": "New Name",                   // optional
  "contactNumber": "9876543210",       // optional
  "age": 30,                           // optional
  "companyDetails": {                  // optional
    "companyName": "Acme Pvt Ltd",
    "address": "Street, City, Pincode",
    "gstin": "12ABCDE3456F7Z8"         // if provided, verified via GST service
  }
}


Special validation

If companyDetails.gstin present, it is validated by external GSTIN service; if invalid → 400.

Success (200)

{
  "message": "User Details Updated Successfully!",
  "user": { /* UserDetails document (upserted) */ }
}


Errors

400 invalid GSTIN or missing required fields (on other endpoints)

401/403 auth/role failures

404 user not found

500 server error

4. Admin routes (/api/v1/admin)
4.1 Register admin
POST /api/v1/admin/register


Request

{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "adminPassword"
}


Success (201)

{
  "message": "User Registered Successfully!",
  "response": {
    "_id": "64c...",
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2025-12-11T09:12:34.000Z"
  }
}


Errors

400 missing fields

409 email exists

4.2 Update admin details (role: admin)
PATCH /api/v1/admin/update/:id


Auth

Authenticate + Authorize(["admin"])

Allowed body fields

{
  "name": "Display Name",           // optional
  "contactNumber": "9876543210",    // optional
  "age": 40                         // optional
}


Success (200)

{
  "message": "User Details Updated Successfully!",
  "user": { /* AdminDetails document (upserted) */ }
}


Errors

403 if requester is not admin

404 user not found

500 server error

5. Logistic client routes (/api/v1/logistic)
5.1 Register logistic client
POST /api/v1/logistic/register


Request

{
  "name": "Logistics Co",
  "email": "logistic@example.com",
  "password": "securePassword"
}


Success (201) similar to other register endpoints with role: "logistic"

Errors

400 missing fields

409 email exists

5.2 Update logistic client details (role: logistic)
PATCH /api/v1/logistic/update/:id


Auth

Authenticate + Authorize(["logistic"])

Allowed body fields

{
  "name": "Name",                // optional
  "companyName": "Logistics Co", // optional
  "gstin": "12ABCDE3456F7Z8",    // optional
  "address": "Addr"
}


Success (200)

{
  "message": "User Details Updated Successfully!",
  "user": { /* LogisticDetails document (upserted) */ }
}


Errors

403 if not logistic role

409 if conflicts (though upsert is used)

500 server error

5.3 Add driver (role: logistic)
POST /api/v1/logistic/driver/add


Auth

Authenticate + Authorize(["logistic"])

Request body (required)

{
  "logisticClientId": "64c...abc",   // logistic client's userId (ObjectId)
  "name": "Driver Name",
  "email": "driver@example.com",
  "contactNumber": "9876543210",
  "licenseNumber": "LIC1234567",
  "vehicleNumber": "MH12AB1234",
  "chasisNo": "CHS123456789"
}


Behavior

Creates a User with role: "driver" and a DriverDetails document.

Generates a temporary password and emails it to the driver's email using nodemailer (Gmail).

Ensures uniqueness by checking email, contactNumber, licenseNumber, vehicleNumber, chasisNo across drivers and users.

Success (201)

{
  "message": "Driver added successfully!",
  "driver": { /* DriverDetails document */ }
}


Errors

400 missing fields

404 logistic client id not found

409 driver already exists (duplicate unique fields or existing User with same email)

500 server error (or nodemailer errors)

5.4 Get all drivers for the authenticated logistic client
GET /api/v1/logistic/driver/getall


Auth

Authenticate + Authorize(["logistic"])

Success (200)

{
  "message": "Drivers fetched successfully!",
  "drivers": [
    { /* DriverDetails */ },
    ...
  ]
}

5.5 Confirm shipment (role: logistic)
POST /api/v1/logistic/shipment/confirm


Auth

Authenticate + Authorize(["logistic"])

Request body

{
  "driverId": "64c...driverUserId",
  "shipmentId": "FFR-ABC123DEF"
}


Behavior

Requires logistic client's auth user: logisticClientId = req.user._id.

Validates driver exists and belongs to logistic client.

Finds Shipment by shipmentId.

Sets shipment.status = "confirmed", shipment.DriverId = driver.userId, shipment.logisticClientId = logisticClientId.

If driver status not "on-duty", sets it to "on-duty" and increments driver.currentOrders.

Success (200)

{
  "message": "Shipment status updated successfully!",
  "shipment": { /* updated Shipment document */ }
}


Errors

400 missing driverId/shipmentId

404 driver or shipment not found

500 server error

5.6 Scan shipment (role: driver)
POST /api/v1/logistic/shipment/scan


Auth

Authenticate + Authorize(["driver"])

Request body

{
  "qrToken": "sid=FFR-ABC123DEF&token=PCK-ABCDE12345"
}


Behavior / rules

qrToken is a URL-style query string: sid=<shipmentId>&token=<token>.

Authenticated user is the driver (driverId from req.user._id).

Finds Shipment where shipmentId matches and DriverId == driver.userId.

Finds DriverDetails for driver.

Token must exactly match either shipment.pickupQrToken or shipment.deliveryQrToken.

If token starts with PCK-:

Shipment must have status === "confirmed" → then set status = "in-transit".

If token starts with DEL-:

Shipment must have status === "in-transit" → then set status = "delivered".

Decrement driver.currentOrders. If currentOrders === 0, set driver.status = "available".

Any mismatch returns error.

Success (200)

{
  "message": "Shipment scanned successfully!",
  "shipment": { /* updated Shipment document */ }
}


Errors

401 unauthorized access (no auth)

400 missing fields, invalid QR token, wrong shipment status

404 driver or shipment not found

409 token mismatch

500 server error

6. Shipment (User) routes (/api/v1/user/order)
6.1 Book shipment (role: user)
POST /api/v1/user/order/book


Auth

Authenticate + Authorize(["user"])

Request body

{
  "pickupLocation": {
    "longitude": 72.123456,
    "latitude": 19.123456,
    "email": "pickup@example.com",
    "address": "Pickup address, City",
    "contactNumber": "9876543210"
  },
  "deliveryLocation": {
    "longitude": 72.654321,
    "latitude": 19.654321,
    "email": "delivery@example.com",
    "address": "Delivery address, City",
    "contactNumber": "9123456780"
  },
  "size": {
    "length": 10,
    "width": 5,
    "height": 3
  },
  "quantity": 1,
  "weight": 2.5,
  "netWeight": 2.5,
  "price": 199.99
}


Validation

All fields listed above are required (non-null). pickupLatitude/pickupLongitude and deliveryLatitude/deliveryLongitude must be numbers.

Behavior

Generates pickupQrToken (PCK-<HEX>) and deliveryQrToken (DEL-<HEX>) and shipmentId (FFR-<HEX>).

Saves Shipment with status: "pending".

Generates QR PNG buffers for both pickup and delivery (using qrcode).

Sends two emails (pickup and delivery) with QR code inline attachments using nodemailer.

Returns created shipment object.

Success (201)

{
  "message": "Shipment booked successfully!",
  "shipment": {
    "_id": "64c...shp",
    "shipmentId": "FFR-ABCDEF123",
    "pickupQrToken": "PCK-ABCDE12345",
    "deliveryQrToken": "DEL-ABCDE12345",
    "userId": "64c...user",
    "pickupDetails": { /* ... */ },
    "deliveryDetails": { /* ... */ },
    "size": { "length": 10, "width": 5, "height": 3 },
    "quantity": 1,
    "weight": 2.5,
    "netWeight": 2.5,
    "price": 199.99,
    "status": "pending",
    "createdAt": "2025-12-11T10:00:00.000Z"
  }
}


Errors

400 missing required fields

500 server error or email send failure

6.2 Get shipment by shipmentId (role: user)
GET /api/v1/user/order/get/:shipmentId


Auth

Authenticate + Authorize(["user"])

Path params

:shipmentId — e.g. FFR-ABC123

Behavior

Finds shipment by shipmentId and userId == req.user._id.

Success (200)

{
  "message": "Shipment fetched!",
  "shipment": { /* Shipment document */ }
}


Errors

400 missing shipmentId

404 shipment not found

500 server error

Models & Field details (for request/response schemas)
User (collection USER)

name: string (required)

email: string (required, unique, lowercase)

pwdhash: string (stored hashed)

role: enum["user","admin","logistic","driver"] (default: user)

createdAt: Date

pwdhash is never returned by fetchdetail (the code selects -pwdhash -__v).

UserDetails (USER_DETAILS)

userId: ObjectId (unique, required)

contactNumber: string

age: number

companyDetails:

companyName: string

gstin: string

address: string

createdAt: Date

LogisticDetails (LOGISTIC_DETAILS)

userId: ObjectId (unique, required)

name, companyName, gstin, address, createdAt

AdminDetails (ADMIN_DETAILS)

userId, name, contactNumber, age, createdAt

DriverDetails (DRIVER_DETAILS)

userId: ObjectId unique

logisticClientId: ObjectId (ref to logistic details)

name, email, contactNumber (Number in schema), licenseNumber, vehicleNumber, chasisNo

status: enum["available","unavailable","on-duty"] (default available)

currentOrders: number (default 0)

createdAt: Date

Shipment (SHIPMENTS)

userId, logisticClientId?, DriverId?

shipmentId: string (unique) — format: FFR-<HEX>

pickupQrToken, deliveryQrToken (unique) — PCK-... / DEL-...

pickupDetails & deliveryDetails each:

longitude (Number), latitude (Number), email (String), address (String), contactNumber (Number)

size: {length, width, height} (Number)

quantity, weight, netWeight, price (Number)

status: enum["confirmed","rejected","pending","in-transit","delivered","cancelled"] (default pending)

createdAt: Date

Utility / External dependencies notes

GSTIN verification uses external API: http://sheet.gstincheck.co.in/check/<API_KEY>/<GSTIN> (configured by GSTIN_VERIFY_API_KEY).

Email sending uses nodemailer with Gmail credentials configured in env: EMAIL_ID and GMAIL_API.

QR generation: qrcode library creates PNG buffers and emails as inline attachments (cid referencing).

JWT secret and Mongo URI must be provided via environment variables per envConfig.

Environment variables required

JWT_SECRET — required

MONGO_URI — required

GSTIN_VERIFY_API_KEY — required

EMAIL_ID — used for nodemailer (optional default empty)

GMAIL_API — nodemailer password / API (optional default empty)

PORT — optional (defaults to 3000)

Example error responses (consistent pattern)
{
  "message": "Error description",
  "error": { /* sometimes included for 500 errors */ }
}

Developer notes & recommendations

Passwords are hashed via bcrypt (saltRounds = 10).

Temporary passwords for drivers are generated with crypto.randomBytes(6).toString('hex').

Important uniqueness constraints: email (User + DriverDetails), driver fields (contactNumber, licenseNumber, vehicleNumber, chasisNo), shipment tokens & shipmentId.

Authenticate expects Authorization header and verifies token; ensure client includes Bearer prefix.

Authorize reads current DB user to verify role — be mindful of role changes or stale tokens.

Consider adding pagination to getDrivers if driver list grows.

Consider rate-limiting and validation libraries (e.g., express-validator) for robust request validation.