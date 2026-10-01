# Military Asset Management System

A full-stack production-ready application for managing military assets, including vehicles, weapons, and ammunition across multiple bases. The system features role-based access control, audit logging, and comprehensive tracking of purchases, transfers, assignments, and expenditures.

## Tech Stack

### Frontend
- **React** with Vite
- **Tailwind CSS** for responsive UI and styling
- **Lucide React** for icons
- **React Router** for navigation
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **Prisma ORM** for database operations
- **JWT** for authentication
- **bcryptjs** for password hashing

## Features

### Database Schema
- **Bases**: Military base locations
- **Users**: System users with roles (Admin, Base Commander, Logistics Officer)
- **Assets**: Equipment tracking (Vehicles, Weapons, Ammunition)
- **Purchases**: Asset acquisition records
- **Transfers**: Inter-base asset transfers
- **Assignments**: Asset assignments to personnel
- **Expenditures**: Field usage and consumption records
- **Audit Logs**: Complete audit trail of all operations

### Security & Access Control
- **JWT-based authentication**
- **Role-based access control (RBAC)**:
  - **Admin**: Full system access
  - **Base Commander**: Read/write access to assigned base only
  - **Logistics Officer**: Access to purchases and transfers management
- **Automatic audit logging** for all mutating operations

### Core Functionality
- **Dashboard**: Real-time metrics with filtering (Opening Balance, Closing Balance, Net Movement, Assigned, Expended)
- **Purchases**: Log and track asset acquisitions
- **Transfers**: Manage inter-base asset transfers with status tracking
- **Assignments**: Assign assets to personnel and track returns
- **Expenditures**: Record field usage and consumption

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

### 1. Clone the Repository

```bash
cd "Military Assest"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Database Configuration

1. Create a PostgreSQL database named `military_assets`

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the `DATABASE_URL` with your PostgreSQL connection string
   - Set a secure `JWT_SECRET`

```bash
# Example .env file
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/military_assets?schema=public"
JWT_SECRET="your-secret-key-change-this-in-production"
PORT=5000
```

3. Run database migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Seed the database with mock data:

```bash
npm run prisma:seed
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

## Running the Application

### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

### Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

## Demo Accounts

The system comes pre-seeded with demo accounts for testing:

| Role | Email | Password | Base |
|------|-------|----------|------|
| Admin | admin@military.gov | password123 | All Bases |
| Base Commander (Alpha) | commander1@military.gov | password123 | Alpha Base |
| Base Commander (Bravo) | commander2@military.gov | password123 | Bravo Base |
| Logistics Officer | logistics@military.gov | password123 | All Bases |

Use the **Quick Login** buttons on the login page to auto-fill credentials.

## Project Structure

```
Military Assest/
├── backend/
│   ├── middleware/
│   │   ├── auth.js          # Authentication & RBAC middleware
│   │   └── audit.js         # Audit logging middleware
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.js          # Database seed script
│   ├── routes/
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── dashboard.js     # Dashboard metrics
│   │   ├── purchases.js     # Purchase management
│   │   ├── transfers.js     # Transfer management
│   │   ├── assignments.js   # Assignment management
│   │   ├── expenditures.js  # Expenditure tracking
│   │   ├── audit.js         # Audit log endpoints
│   │   ├── bases.js         # Base management
│   │   └── assets.js        # Asset management
│   ├── utils/
│   │   └── db.js            # Prisma client
│   ├── server.js            # Express server setup
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx   # Main layout component
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx   # Login page
│   │   │   ├── Dashboard.jsx  # Dashboard page
│   │   │   ├── Purchases.jsx  # Purchases page
│   │   │   ├── Transfers.jsx  # Transfers page
│   │   │   └── Assignments.jsx  # Assignments & Expenditures
│   │   ├── App.jsx          # Main app component
│   │   ├── index.css        # Tailwind CSS imports
│   │   └── main.jsx         # React entry point
│   ├── tailwind.config.js   # Tailwind configuration
│   ├── vite.config.js       # Vite configuration with proxy
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Dashboard
- `GET /api/dashboard/metrics` - Get dashboard metrics with filters

### Purchases
- `POST /api/purchases` - Create new purchase (Admin, Logistics Officer)
- `GET /api/purchases` - Get purchases with filters

### Transfers
- `POST /api/transfers` - Create new transfer (Admin, Logistics Officer)
- `PATCH /api/transfers/:id/status` - Update transfer status
- `GET /api/transfers` - Get transfers with filters

### Assignments
- `POST /api/assignments` - Create assignment (Admin, Base Commander)
- `PATCH /api/assignments/:id/return` - Return assignment
- `GET /api/assignments` - Get assignments with filters

### Expenditures
- `POST /api/expenditures` - Create expenditure (Admin, Base Commander)
- `GET /api/expenditures` - Get expenditures with filters

### Audit Logs
- `GET /api/audit-logs` - Get audit logs (Admin only)

### Bases & Assets
- `GET /api/bases` - Get all bases
- `GET /api/assets` - Get assets with base filtering

## Usage Guide

### Dashboard
- View real-time asset metrics
- Filter by date range, base, and equipment type
- Click on "Net Movement" to see detailed breakdown

### Purchases
- Log new asset purchases
- View purchase history with advanced filtering
- Track which base received which assets

### Transfers
- Initiate transfers between bases
- Track transfer status (Pending, Completed, Cancelled)
- Approve or cancel pending transfers

### Assignments
- Assign assets to personnel
- Track active assignments
- Return assets when assignments complete

### Expenditures
- Record field usage and consumption
- Track ammunition usage
- Monitor depletion rates

## Development Notes

### Security Considerations
- Change the `JWT_SECRET` in production
- Use strong passwords for database
- Enable HTTPS in production
- Implement rate limiting for API endpoints
- Add input validation and sanitization

### Future Enhancements
- Real-time notifications for transfers
- Advanced reporting and analytics
- Barcode/QR code scanning for assets
- Mobile-responsive optimization
- Multi-language support
- Integration with inventory management systems

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify DATABASE_URL in .env file
- Check database credentials

### CORS Errors
- The frontend proxy is configured in vite.config.js
- Ensure backend is running on port 5000

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`

## License

This project is for demonstration purposes only.

## Support

For issues or questions, please refer to the project documentation or contact the development team.
