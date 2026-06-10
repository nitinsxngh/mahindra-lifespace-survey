# Algoqube Survey Portal

A responsive survey portal built with **Next.js**, **Node.js API routes**, and **MongoDB**. Users log in with phone number + OTP, rank four services by priority (1–4), and submit once per phone number.

## Features

- Phone number + OTP authentication (dev mode logs OTP to console)
- Four services with image, description, and monthly rate
- Priority ranking survey (1 = most preferred, 4 = least preferred)
- One submission per phone number — survey closes after submit
- Responsive UI for mobile, tablet, and desktop
- JWT session via HTTP-only cookie

## Project Structure

```
src/
├── app/
│   ├── api/           # Node.js API routes
│   │   ├── auth/      # send-otp, verify-otp, logout
│   │   └── survey/    # status, submit
│   ├── survey/        # Survey page
│   └── page.tsx       # Login page
├── components/
│   ├── auth/          # LoginForm
│   ├── survey/        # SurveyForm, ServiceCard, SuccessMessage
│   ├── layout/        # Header
│   └── ui/            # Button, Alert
├── lib/               # mongodb, auth, otp, api-response
├── models/            # Mongoose schemas
└── types/             # Shared TypeScript types
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   ```
   MONGODB_URI=mongodb://localhost:27017/algoqube-survey
   JWT_SECRET=your-super-secret-jwt-key
   DEV_MODE=true
   ```

3. **Seed services**

   ```bash
   npm run seed
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Usage Flow

1. Enter a 10-digit Indian mobile number
2. Receive OTP (printed in terminal when `DEV_MODE=true`)
3. Verify OTP → redirected to survey
4. Assign priorities 1–4 to each service
5. Submit → success message; same number cannot survey again

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Verify OTP & create session |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/services` | List active services |
| GET | `/api/survey/status` | Check if user completed survey |
| POST | `/api/survey/submit` | Submit rankings |

## Production Notes

- Set `DEV_MODE=false` and integrate an SMS provider (Twilio, MSG91, etc.) in `send-otp/route.ts`
- Use a strong `JWT_SECRET`
- Use MongoDB Atlas or a managed MongoDB instance
- Deploy on Vercel, Railway, or any Node.js host

## License

MIT
