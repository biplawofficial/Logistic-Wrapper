🚀 Features

JWT-based authentication for User, Admin, Logistic Client, Driver

Role-based access control (RBAC)

Shipment booking with auto-generated:

Unique shipment ID (FFR-XXXXX)

Pickup & delivery QR tokens

QR PNG attachments sent via email

Logistic driver management

QR-scan workflow for:

Pickup → In-Transit

Delivery → Delivered

GSTIN verification for companies

Nodemailer email notifications

Complete MongoDB data models

Clean modular code with controllers, routes, and middleware separation

📁 Project Structure
/config
  envConfig.js
  dbConnect.js
/controllers
  AuthController.js
  UserController.js
  AdminController.js
  LogisticController.js
  ShipmentController.js
/middleware
  Authenticate.js
  Authorize.js
/models
  User.js
  UserDetails.js
  LogisticDetails.js
  AdminDetails.js
  DriverDetails.js
  Shipment.js
/routes
  AuthRoutes.js
  UserRoutes.js
  AdminRoutes.js
  LogisticRoutes.js
  ShipmentRoutes.js
/utils
  gstinCheck.js
  mailer.js
  qrGenerator.js
app.js
server.js

⚙️ Environment Variables

Create a .env file:

PORT=3000
MONGO_URI=<your_mongo_uri>

JWT_SECRET=<jwt_secret>

GSTIN_VERIFY_API_KEY=<gstin_api_key>

EMAIL_ID=<gmail_address>
GMAIL_API=<gmail_app_password_or_api_key>

🛠️ Installation & Setup
1. Clone the repository
git clone https://github.com/<your-username>/<repo>.git
cd <repo>

2. Install dependencies
npm install

3. Add environment variables

Create a .env file using the template above.

4. Start the server
npm start


Server runs on:

http://localhost:<PORT>/api/v1

🔐 Authentication

FastFare uses JWT tokens for secure authentication.
Include token in all protected endpoints:

Authorization: Bearer <JWT_TOKEN>

📚 API Endpoints Summary
Auth
Method	Endpoint	Description
POST	/login	Login and receive JWT
User (role: user)
Method	Endpoint	Description
POST	/user/register	Register user
PATCH	/user/update/:id	Update profile & GSTIN-enabled company details
POST	/user/order/book	Book a shipment
GET	/user/order/get/:shipmentId	Get shipment details
Admin (role: admin)
Method	Endpoint	Description
POST	/admin/register	Register admin
PATCH	/admin/update/:id	Update admin details
Logistic Client (role: logistic)
Method	Endpoint	Description
POST	/logistic/register	Register logistic company
PATCH	/logistic/update/:id	Update logistic profile
POST	/logistic/driver/add	Add driver (auto email with temp password)
GET	/logistic/driver/getall	Fetch all drivers
POST	/logistic/shipment/confirm	Assign driver and confirm shipment
Driver (role: driver)
Method	Endpoint	Description
POST	/logistic/shipment/scan	Scan pickup/delivery QR token
🚚 Shipment Workflow Overview
1️⃣ User Books Shipment

Validates user input

Generates:

Shipment ID → FFR-<random>

Pickup QR → PCK-<token>

Delivery QR → DEL-<token>

Sends emails with QR images

Status = pending

2️⃣ Logistic Client Confirms Shipment

Assigns driver

Status → confirmed

Driver status → on-duty

3️⃣ Driver Scans Pickup QR

Valid token pattern → PCK-*

Status → in-transit

4️⃣ Driver Scans Delivery QR

Valid token pattern → DEL-*

Status → delivered

Driver:

currentOrders--

If 0 → status → available

🧩 Database Models
User

name

email

pwdhash

role (user, admin, logistic, driver)

Shipment

shipmentId

qr tokens

pickup & delivery details

status

logisticClientId

driverId

timestamps

DriverDetails

logisticClientId

license, vehicle, chassis

status

currentOrders

(And similar for AdminDetails, UserDetails, LogisticDetails.)

✨ Tech Stack

Node.js

Express.js

MongoDB (Mongoose)

JWT Authentication

Nodemailer

QR Code Generator

External GSTIN API

🧪 Testing

Use Postman/ThunderClient with:

Headers:
Content-Type: application/json
Authorization: Bearer <JWT>

🤝 Contributing

Fork the repo

Create a feature branch

Commit your changes

Create a Pull Request

📄 License

This project is licensed under the MIT License.