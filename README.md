# ZPlotApp - Real Estate Plot Management System

ZPlotApp is a comprehensive real estate plot management system built with Next.js and Firebase, designed for real estate companies to efficiently manage their plot inventory, client visits, and administrative tasks.

## Features

### Multi-Role User System
- **Super Admin**: Full system access and management
- **Admin**: Project and user management
- **Manager**: Handle site visits, client assistance, and plot management
- **Client**: View purchased plots, request visits, and manage their properties
- **Guest**: Browse available plots and request site visits

### Plot Management
- Interactive grid-based plot layout visualization
- Detailed plot information (size, price, status, features)
- QR code-based plot identification and tracking

### Project Management
- Create and manage real estate projects
- Track plot availability and sales statistics
- Configure project geofencing for on-site verification

### Visit Management
- Time slot booking system
- QR code-based visit verification
- Visit request approval workflow
- Visit feedback collection

### Manager Tools
- Task assignment and tracking
- Attendance tracking with geofencing
- Leave request management
- Performance feedback

### Additional Features
- Real-time updates with Firebase Realtime Database
- Responsive design for all devices
- Secure authentication and role-based access
- Analytics and reporting

## Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **UI Components**: Radix UI, Lucide React icons
- **State Management**: React Context API
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Hosting**: Vercel
- **Maps & Geolocation**: (Integrated with geofencing capabilities)
- **Charts & Analytics**: Recharts, Chart.js

## Getting Started

### Prerequisites
- Node.js (18.x or later)
- npm or yarn or pnpm
- Firebase account

### Installation

1. Clone the repository
   ```
   git clone https://github.com/Chandrujaganath/ZPlotapp.git
   cd ZPlotapp
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up Firebase
   - Create a Firebase project
   - Enable Authentication, Firestore, and Storage
   - Create a web app in your Firebase project
   - Add your Firebase configuration to `.env.local` file:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your-database-url
   
   # Firebase Admin Configuration (for server-side operations)
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY="your-private-key"
   ```

4. Run the development server
   ```
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `/app`: Application routes and pages using Next.js App Router
- `/components`: Reusable UI components
- `/lib`: Utility functions, Firebase services, and data models
- `/public`: Static assets
- `/styles`: Global styles

## Deployment

The application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add your environment variables in the Vercel project settings
3. Deploy!

## License

This project is proprietary software.

## Contact

For questions or support, please contact the project maintainer.