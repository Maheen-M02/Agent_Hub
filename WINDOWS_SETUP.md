# Windows Setup Guide for Agent Hub

## Prerequisites

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/

## Quick Setup

### Option 1: Automated Setup (Recommended)
Simply run the setup script:
```cmd
setup.bat
```

### Option 2: Manual Setup

1. **Install Dependencies**
   ```cmd
   npm install
   ```

2. **Create Environment File**
   ```cmd
   copy .env.example .env
   ```

3. **Configure Environment Variables**
   Edit `.env` file with your API keys:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `GOOGLE_GEMINI_API_KEY` - Your Google Gemini API key

4. **Run Development Server**
   ```cmd
   npm run dev
   ```

5. **Open in Browser**
   Navigate to: http://localhost:3000

## Available Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, you can specify a different port:
```cmd
set PORT=3001 && npm run dev
```

### Module Not Found Errors
Clear cache and reinstall:
```cmd
rmdir /s /q node_modules
rmdir /s /q .next
npm install
```

### API Connection Issues
1. Verify your `.env` file exists and contains valid API keys
2. Check that Supabase project is active
3. Ensure API keys are not expired

## Project Structure

```
agent_hub/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── agents/            # Agent pages
│   ├── assistant/         # AI assistant
│   └── dashboard/         # User dashboard
├── components/            # React components
│   ├── agents/           # Agent-specific components
│   ├── assistant/        # Chat interface
│   ├── layout/           # Layout components
│   └── ui/               # UI components (shadcn)
├── lib/                   # Utility libraries
│   ├── gemini.ts         # Gemini AI integration
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Helper functions
└── supabase/             # Database migrations

```

## Notes

- The Supabase configuration is already set up in `lib/supabase.ts`
- API keys in the code are fallback values for development
- For production, always use environment variables
- Windows paths use backslashes, but the project handles this automatically
