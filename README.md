# Member Contribution Tracker

MVP web app for members, proposed contributions, payments, pending balances, notes, due dates and sponsor follow-ups.

## Stack
Next.js + TypeScript + Tailwind + Supabase + Vercel.

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in Supabase SQL Editor.
3. Copy `.env.example` to `.env.local` and add your Supabase URL + anon key.
4. Run `npm install`.
5. Run `npm run dev`.

## Current MVP
- Dashboard totals
- Members list
- Add member
- Member payment history
- Member notes
- Automatic pending balance/status
- Due/overdue members
- Sponsor referrals + meeting date/time/status

## Next production phase
- Login screen
- Admin / Coordinator / Member roles
- Member self-view permissions
- Audit log
- Sponsor payment history
- Search + filters
- CSV/PDF export
- Vercel deployment
