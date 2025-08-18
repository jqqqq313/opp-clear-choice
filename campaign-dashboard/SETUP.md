# Campaign Command Dashboard - Setup Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js** (version 18 or higher) - Download from [nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)

### Installation Steps

1. **Extract the ZIP file** and navigate to the project directory:
   ```bash
   cd campaign-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Seed the database with sample data**:
   ```bash
   npx tsx scripts/seed.ts
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser** and go to: `http://localhost:3000`

## 🔐 Login Credentials

**Admin Account:**
- Email: `admin@campaign.com`
- Password: `admin123`

## 📋 Features Included

### ✅ **Core Features (Ready to Use)**
- **Authentication System** - Role-based access (Admin, Campaign Manager, Volunteer)
- **Dashboard** - Analytics, stats, and recent activity
- **Volunteer Management** - Add, edit, search, and filter volunteers
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Database** - SQLite with sample data included

### 🚧 **Features Ready to Implement**
- **Event Management** - Create events, RSVP tracking, attendance
- **Task Assignment** - Assign tasks, check-in/check-out tracking
- **Notifications** - SMS/Email reminders and alerts
- **CSV Import/Export** - Bulk volunteer management
- **White-label Branding** - Custom colors, logos, multi-campaign support
- **Subscription Management** - Stripe integration for billing

## 📁 Project Structure

```
campaign-dashboard/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # React components
│   ├── lib/                 # Configuration and utilities
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Helper functions
├── prisma/                 # Database schema and migrations
├── scripts/               # Database seed scripts
└── public/               # Static assets
```

## 🛠 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Reset database (if needed)
npx prisma db push --force-reset
npx tsx scripts/seed.ts

# View database (optional)
npx prisma studio
```

## 🗄 Database

The project uses SQLite for development (no external database required). The database file is `prisma/dev.db`.

### Sample Data Included:
- 1 Admin user
- 4 Sample volunteers with different skills and availability
- Event types (Town Hall, Fundraiser, Phone Bank, Canvass)
- Task categories (Outreach, Admin, Events, Media)

## 🎨 Customization

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Email/SMS Configuration
EMAIL_FROM="noreply@yourdomain.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Optional: Twilio for SMS
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Optional: Stripe for Payments
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

### Adding New Features

The codebase is structured to easily add new features:

1. **New Pages**: Add to `src/app/dashboard/`
2. **New Components**: Add to `src/components/`
3. **New API Routes**: Add to `src/app/api/`
4. **Database Changes**: Modify `prisma/schema.prisma`

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- DigitalOcean

## 🆘 Troubleshooting

### Common Issues:

1. **"Module not found" errors**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Database errors**:
   ```bash
   npx prisma db push --force-reset
   npx tsx scripts/seed.ts
   ```

3. **Port already in use**:
   ```bash
   npm run dev -- -p 3001
   ```

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Ensure all dependencies are installed
3. Verify Node.js version (18+)
4. Check that port 3000 is available

## 🎯 Next Steps

1. **Customize the branding** - Update colors, logo, and campaign name
2. **Add your volunteers** - Import via CSV or add manually
3. **Create events** - Set up your campaign events
4. **Configure notifications** - Set up email/SMS for reminders
5. **Deploy to production** - Make it live for your campaign team

---

**Happy Campaigning! 🗳️**