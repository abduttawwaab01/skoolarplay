# SkoolarPlay

Nigeria's #1 gamified learning platform. A Duolingo-style educational platform featuring WAEC, JAMB, NECO preparation, Nigerian languages, and more.

![SkoolarPlay Banner](public/logo.png)

## Features

### Core Learning
- **Interactive Quizzes**: Multiple choice, fill-in-the-blank, drag-and-drop, matching, and ordering questions
- **Course System**: Structured learning paths with modules and lessons
- **Progress Tracking**: Real-time progress monitoring with XP and gems
- **Certificates**: Earn certificates upon course completion

### Gamification
- **XP System**: Earn experience points for completing lessons
- **Gems**: Collect gems for unlocking premium features
- **Hearts**: Lives system that adds challenge
- **Streaks**: Daily learning streaks with bonus rewards
- **Leaderboards**: Daily, weekly, and all-time rankings
- **Achievements**: Unlock badges for milestones

### Special Features
- **AI Tutor**: Chat with an AI-powered learning assistant
- **Daily Challenges**: New challenges every day
- **Boss Battles**: RPG-style course challenges
- **Spin the Wheel**: Daily rewards wheel
- **Mystery Boxes**: Random reward boxes
- **Study Groups**: Collaborative learning
- **Referral System**: Earn gems by inviting friends

### Admin Features
- **User Management**: View and manage users
- **Content Management**: Create and edit courses, lessons, questions
- **Analytics Dashboard**: Track platform usage
- **Feature Flags**: Toggle features on/off
- **Audit Logs**: Track important system actions

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS
- **shadcn/ui** - Reusable UI components
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Query** - Data fetching

### Backend
- **Next.js API Routes** - Serverless API
- **Prisma ORM** - Database ORM
- **Turso** - Edge SQLite database
- **NextAuth.js v4** - Authentication

### External Services
- **OpenRouter** - AI chat (free tier available)
- **Paystack** - Nigerian payments
- **Upstash Redis** - Rate limiting (free tier)
- **Vercel** - Hosting and serverless functions

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun
- Turso CLI (for local database)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/skoolarplay.git
cd skoolarplay
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your values
```

4. **Set up local database**
```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create local database
turso dev --file-file ./prisma/dev.db

# Update DATABASE_URL in .env
DATABASE_URL=file:./prisma/dev.db
```

5. **Push schema to database**
```bash
npm run db:push
```

6. **Seed initial data (optional)**
```bash
npm run seed
```

7. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start.

## Environment Variables

See [.env.example](.env.example) for all required variables.

### Required for Development:
- `DATABASE_URL` - SQLite database path or Turso URL
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your local URL (http://localhost:3000)

### Optional for Development:
- `OPENROUTER_API_KEY` - For AI chat (fallback to ZAI SDK)
- `PAYSTACK_SECRET_KEY` - For payment testing

## Deployment

### Vercel (Recommended)

1. Fork or push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

```bash
# Using Vercel CLI
vercel --prod
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Environment Setup for Production

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Complete environment variable list
- Database setup with Turso
- Payment configuration with Paystack
- AI setup with OpenRouter
- Monitoring and alerting

## Project Structure

```
skoolarplay/
├── prisma/              # Database schema and migrations
│   ├── schema.prisma    # Database schema
│   └── seed.ts         # Database seeding
├── public/              # Static assets
│   ├── sw.js           # Service worker
│   └── manifest.json    # PWA manifest
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── api/       # API routes
│   │   │   ├── auth/  # Authentication
│   │   │   ├── cron/  # Cron jobs
│   │   │   └── ...    # Other endpoints
│   │   └── page.tsx   # Main page
│   ├── components/     # React components
│   │   ├── layout/    # Layout components
│   │   ├── pages/     # Page components
│   │   ├── shared/    # Shared components
│   │   └── ui/        # shadcn/ui components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   │   ├── auth.ts    # NextAuth config
│   │   ├── db.ts      # Prisma client
│   │   ├── premium.ts # Premium feature gating
│   │   └── ...        # Other utilities
│   └── store/          # Zustand stores
├── .env.example        # Environment template
├── vercel.json        # Vercel config
├── package.json
└── tsconfig.json
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type check
npm run db:push      # Push schema changes
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
npm run seed         # Seed database
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. See [LICENSE](LICENSE) for details.

## Support

- Create an issue for bugs
- Join our Discord for community support
- Email support@skoolarplay.com for business inquiries

## Roadmap

- [x] Core learning system
- [x] Gamification features
- [x] AI tutor integration
- [x] Payment integration
- [x] Offline support (PWA)
- [ ] Mobile apps (iOS/Android)
- [ ] Video lessons
- [ ] Live tutoring
- [ ] Certifications (official)

---

Built with ❤️ for Nigerian students
