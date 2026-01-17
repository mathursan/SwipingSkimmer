# SwipingSkimmer

A comprehensive pool service management platform that replicates and extends the functionality of Skimmer (https://www.getskimmer.com/). This all-in-one solution helps pool service companies manage routes, scheduling, billing, customer relationships, and technician coordination.

## Features

### Back Office (Web Application)
- **Route Optimization**: Automatically optimize service routes to reduce travel distance by 200+ miles per month
- **Scheduling**: Manage recurring and one-off service visits with calendar view
- **Customer Management (CRM)**: Complete customer database with service history, equipment info, and billing details
- **Billing & Payments**: Automated invoicing, payment processing, AutoPay, and QuickBooks integration
- **Service Reports**: Automated email reports with photos and chemical readings
- **Real-time Tracking**: Live tracking of technicians and route progress
- **Dashboard**: Real-time business metrics and insights

### Mobile Application (Technician)
- **Offline-First**: Complete services offline, sync when connection restored
- **Route Management**: View optimized routes, navigate to stops, adjust route order
- **Service Checklists**: Customizable checklists for consistent service visits
- **Chemical Readings**: Enter readings with automatic LSI calculation and dosing recommendations
- **Photo Capture**: Take and upload service photos
- **Customer Info**: Access customer details, gate codes, service history

### Customer Experience
- **Service Reports**: Automated emails after each service with photos and readings
- **Online Payments**: Pay invoices online with credit/debit cards
- **AutoPay**: Set up automatic recurring payments
- **Communication**: Text message notifications for service reminders and updates

## Project Structure

```
SwipingSkimmer/
├── docs/
│   ├── feature specs/          # Feature specifications
│   │   └── 1-pool-service-management-platform.md
│   └── rfcs/                   # Technical design documents
│       └── 1-pool-service-management-platform.md
├── backend/                    # API server
├── frontend/                    # Web application
├── mobile/                      # Mobile application
└── README.md
```

## Documentation

- **Feature Specification**: [docs/feature specs/1-pool-service-management-platform.md](docs/feature%20specs/1-pool-service-management-platform.md)
- **Technical Design**: [docs/rfcs/1-pool-service-management-platform.md](docs/rfcs/1-pool-service-management-platform.md)
- **Customer Management Implementation**: [CUSTOMER_MANAGEMENT_IMPLEMENTATION.md](CUSTOMER_MANAGEMENT_IMPLEMENTATION.md)

## Technology Stack

### Backend
- **API Server**: Node.js/Express with TypeScript ✅
- **Database**: PostgreSQL ✅
- **Real-time**: WebSocket server (pending)
- **File Storage**: AWS S3 (pending)
- **Payment Processing**: Stripe (pending)
- **Email**: SendGrid (pending)
- **SMS**: Twilio (pending)

### Frontend
- **Web App**: React with TypeScript + Vite ✅
- **Maps**: Mapbox or Google Maps (pending)
- **State Management**: React hooks (can be extended to Redux/Zustand)

### Mobile
- **Framework**: React Native
- **Offline Storage**: SQLite
- **Maps**: React Native Maps

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database
- npm or yarn

### Quick Start

1. **Backend Setup**:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
createdb swipingskimmer
npm run migrate
npm run dev
```

2. **Frontend Setup**:
```bash
cd frontend
npm install
npm run dev
```

3. Open http://localhost:3000 in your browser

For detailed setup instructions, see [CUSTOMER_MANAGEMENT_IMPLEMENTATION.md](CUSTOMER_MANAGEMENT_IMPLEMENTATION.md)

## Development Status

- ✅ Feature specification completed
- ✅ Technical design completed
- ✅ Project structure initialized
- ✅ **Customer Management implemented** (Backend API + Frontend UI)
- ⏳ Route optimization (pending)
- ⏳ Scheduling (pending)
- ⏳ Billing & Payments (pending)
- ⏳ Mobile app (pending)

## License

(To be determined)
