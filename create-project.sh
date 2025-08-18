#!/bin/bash

echo "🚀 Creating Campaign Command Dashboard locally..."

# Create project directory
mkdir -p campaign-dashboard
cd campaign-dashboard

# Initialize package.json
cat > package.json << 'EOF'
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
EOF

echo "✅ Created package.json"

# Create Next.js config
cat > next.config.ts << 'EOF'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
EOF

# Create TypeScript config
cat > tsconfig.json << 'EOF'
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
EOF

# Create Tailwind config
cat > tailwind.config.ts << 'EOF'
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
EOF

# Create PostCSS config
cat > postcss.config.mjs << 'EOF'
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# database
*.db
*.db-journal
EOF

# Create environment example
cat > .env.example << 'EOF'
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# App Configuration
APP_NAME="Campaign Command Dashboard"
APP_URL="http://localhost:3000"
EOF

# Create actual .env for development
cat > .env << 'EOF'
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="development-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
APP_NAME="Campaign Command Dashboard"
APP_URL="http://localhost:3000"
EOF

echo "✅ Created configuration files"
echo "📁 Project structure created!"
echo "📋 Next steps:"
echo "   1. cd campaign-dashboard"
echo "   2. npm install"
echo "   3. I'll provide the source code files next..."
EOF