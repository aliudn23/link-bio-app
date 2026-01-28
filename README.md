# LinkBio App

A modern, feature-rich link-in-bio application built with Next.js 16, PostgreSQL, and Prisma. Create beautiful, customizable landing pages with analytics tracking.

## Features Implemented

### Core Features
- User Authentication
- Link Management (CRUD)
- Dashboard
- Public Profile Page

### Advanced Features
- Drag & Drop Reordering
- Click Tracking & Analytics
- Dark Mode
- Custom Theme Colors

## Tech Stack

- **Frontend**: Next.js 16.1.5 (App Router, React 19, Turbopack)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 7.3.0
- **Authentication**: JWT (jsonwebtoken)
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **Form Handling**: react-hook-form
- **Language**: TypeScript

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ installed and running
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd link-bio-app
```

### 2. Install Dependencies
```bash
npm install
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://dev:your_password@localhost:5432/yourdb?schema=public"
JWT_SECRET="your_super_secret_jwt_key_change_this_in_production"
```

### 5. Database Migration
```bash
# Push schema to database
npx prisma db push --config=./prisma/prisma.config.js

# Generate Prisma Client
npx prisma generate
```

### 6. Run Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Database Schema

```prisma
model User {
  id         String   @id @default(cuid())
  email      String   @unique
  password   String
  name       String
  bio        String?
  avatar     String?
  darkMode   Boolean  @default(false)
  themeColor String   @default("#3B82F6")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  links      Link[]
}

model Link {
  id          String       @id @default(cuid())
  title       String
  url         String
  active      Boolean      @default(true)
  order       Int          @default(0)
  clicks      Int          @default(0)
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  clickEvents ClickEvent[]
}

model ClickEvent {
  id        String   @id @default(cuid())
  linkId    String
  link      Link     @relation(fields: [linkId], references: [id], onDelete: Cascade)
  userAgent String?
  referer   String?
  createdAt DateTime @default(now())
}
```

## Time Breakdown

### Phase 1: Project Setup & Database
- Next.js project initialization
- PostgreSQL database setup
- Prisma 7 configuration and schema design

### Phase 2: Authentication System
- JWT authentication implementation
- User registration API
- Authentication middleware

### Phase 3: Core Features
- Links CRUD API endpoints
- Link management UI
- Public profile page

### Phase 4: Advanced Features
- Drag & drop library integration (@dnd-kit)
- Drag & drop implementation in dashboard
- Click tracking system
- Analytics dashboard display
- Dark mode toggle
- Theme color customization
- Color picker integration

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Links Management
- `GET /api/links` - Get all user links
- `POST /api/links` - Create new link
- `GET /api/links/[id]` - Get single link
- `PATCH /api/links/[id]` - Update link
- `DELETE /api/links/[id]` - Delete link
- `POST /api/links/reorder` - Reorder links
- `POST /api/links/[id]/track` - Track link click

### Analytics
- `GET /api/analytics` - Get user analytics

### User Profile
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update profile

### Public
- `GET /api/public/[id]` - Get public profile

## Usage

1. **Register**: Create an account at `/register`
2. **Login**: Sign in at `/login`
3. **Dashboard**: Manage links at `/dashboard`
   - Add new links
   - Edit existing links
   - Toggle link visibility
   - Drag to reorder links
   - View analytics
   - Customize theme
   - Toggle dark mode
4. **Public Profile**: Share your profile at `/{your-user-id}`

## License

This project is for technical test and portfolio purposes.
