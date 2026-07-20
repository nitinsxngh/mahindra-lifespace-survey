# Mahindra Happinest Palghar Survey Portal

A responsive amenity survey portal built with **Next.js**, **Node.js API routes**, and **MongoDB**.

Each resident receives a **unique secure invite link**. Opening the link auto-fills their mobile number (locked), then they verify with OTP, accept the disclaimer, pick 2 amenities, and submit once.

## Features

- Unique encrypted invite links generated from Excel (400+ residents)
- Phone number locked to the invite (cannot be changed)
- OTP verification via Fast2SMS Quick SMS
- Disclaimer with Agree and Continue
- Choose exactly 2 amenities by priority
- One submission per invite (same phone can have multiple unit invites)
- Responsive UI for mobile, tablet, and desktop
- JWT session via HTTP-only cookie

## Generate unique links from Excel

1. Put your Excel in `Documents/` (columns should include):
   - Tower
   - SAP Customer Code
   - Unit Number
   - Booking Date
   - Primary Applicant Name
   - Applicant Mobile
   - Applicant Email
   - Link (filled by the script)

2. Set your public site URL in `.env`:

   ```
   SURVEY_BASE_URL=https://your-domain.com
   ```

3. Run:

   ```bash
   npm run generate-links
   ```

   Optional custom paths:

   ```bash
   npm run generate-links -- ./Documents/your-file.xlsx ./Documents/output-with-links.xlsx
   ```

4. Share the `Link` column values with each resident (SMS/email).

Each link looks like:

```
https://your-domain.com/invite/<secure-token>
```

Tokens are 32-byte cryptographically random values (base64url). They are stored in MongoDB and validated on every login/OTP/submit.

## Usage Flow

1. Resident opens their unique invite link
2. Mobile number appears automatically (read-only)
3. Send OTP → Verify
4. Agree to disclaimer
5. Select 2 amenities in order of preference
6. Review → Submit survey

## Setup

```bash
npm install
cp .env.example .env
npm run seed
npm run generate-links
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invite/:token` | Validate invite + return locked phone |
| POST | `/api/auth/send-otp` | Send OTP (requires inviteToken) |
| POST | `/api/auth/verify-otp` | Verify OTP & create session |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/services` | List active amenities |
| GET | `/api/survey/status` | Check if invite completed survey |
| POST | `/api/survey/submit` | Submit rankings |

## Production Notes

- Set a strong `JWT_SECRET`
- Set `SURVEY_BASE_URL` to your live domain before generating links
- Set `FAST2SMS_API_KEY` for OTP SMS via Quick SMS route
- Configure SMTP (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`) to send confirmation emails after survey submit
- Keep invite Excel outputs private (links grant survey access)

## License

MIT
