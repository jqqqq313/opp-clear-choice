# Campaign Command Dashboard - Complete Project Files

## 🚀 Quick Setup Instructions

1. Create a new folder called `campaign-dashboard`
2. Copy each file below into the correct location
3. Run the setup commands

## 📁 File Structure

```
campaign-dashboard/
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── .env
├── .gitignore
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   ├── globals.css
│   │   ├── auth/signin/page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── volunteers/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       └── volunteers/route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   ├── auth/
│   │   │   └── SignInForm.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   └── RecentActivity.tsx
│   │   └── volunteers/
│   │       ├── VolunteerList.tsx
│   │       └── AddVolunteerModal.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── auth.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── auth.ts
│   │   ├── date.ts
│   │   └── csv.ts
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts
└── README.md
```

---

## 📄 FILE CONTENTS

### 1. package.json
```json
{
  "name": "campaign-dashboard",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18",
    "react-dom": "^18",
    "@prisma/client": "^6.14.0",
    "prisma": "^6.14.0",
    "@next-auth/prisma-adapter": "^1.0.7",
    "next-auth": "^4.24.7",
    "bcryptjs": "^2.4.3",
    "@types/bcryptjs": "^2.4.6",
    "jsonwebtoken": "^9.0.2",
    "@types/jsonwebtoken": "^9.0.6",
    "@stripe/stripe-js": "^4.1.0",
    "stripe": "^16.2.0",
    "nodemailer": "^6.9.14",
    "@types/nodemailer": "^6.4.15",
    "twilio": "^5.2.2",
    "recharts": "^2.12.7",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.427.0",
    "@heroicons/react": "^2.1.5",
    "papaparse": "^5.4.1",
    "@types/papaparse": "^5.3.14",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "eslint": "^8",
    "eslint-config-next": "14.2.5",
    "tsx": "^4.16.5"
  }
}
```

### 2. .env
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="development-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
APP_NAME="Campaign Command Dashboard"
APP_URL="http://localhost:3000"
```

### 3. next.config.ts
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

### 4. tsconfig.json
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 5. tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
```

### 6. postcss.config.mjs
```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

---

## 🚀 Setup Commands

After creating all files, run these commands in the project directory:

```bash
npm install
npx prisma generate
npx prisma db push
npx tsx scripts/seed.ts
npm run dev
```

Then open http://localhost:3000 and login with:
- Email: admin@campaign.com
- Password: admin123

---

Would you like me to continue with the remaining files? This is getting quite long, so I can break it into smaller parts or provide specific files you need most.