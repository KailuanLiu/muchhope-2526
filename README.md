## Table of Contents

- [Overview](#overview)
  - [Purpose](#purpose)
  - [Team](#team)
- [Getting Started And Contributing](#getting-started-and-contributing)

## Much Hope

# Overview

**Organizer**: Sujana Panthulu

**Purpose**: Sujana Panthulu, the primary coordinator of MUCH Hope, manages 40–100 volunteer events per year largely on her own, relying on a combination of Google Sheets, Google Drive, and word-of-mouth outreach. This fragmented workflow makes it difficult to scale the organization's impact, onboard new volunteers efficiently, or communicate opportunities to schools, partners, and community members in a centralized way. Without a dedicated website or volunteer management system, Much Hope lacks the visibility and infrastructure needed to match its 20-year history of community service. The purpose of this project is to build their website and a full-stack volunteer management platform that consolidates these scattered tools into one cohesive system. This gives Sujana an admin dashboard to manage events and volunteers, while giving community members an accessible, easy-to-use interface to learn about and sign up for opportunities.

## Outside Resource

- [Much Hope Facebook] (https://www.facebook.com/MuchHopeSanJose/)
- [Much Hope Website] (https://altosfoundation.org/ministries/much-hope/)

### Team

The Much Hope team consists of {#} Cal Poly students. Over the course of about 9 months, we worked as a team to deploy this web application. The team members are listed below:

- [Ansita Agrawal](https://www.linkedin.com/in/ansitaa/) - Project Manager
- [Kailuan Liu](https://www.linkedin.com/in/kailuanliu/) - Tech Lead
- [Anna Huang](https://www.linkedin.com//in/anna-huang) - Tech Lead
- [Tracy Le](https://www.linkedin.com/) - Designer
- [Siqi Liang](https://www.linkedin.com/) - Designer
- [Meher Anklesaria](https://www.linkedin.com/) - Designer
- [Briana Kirkman](https://www.linkedin.com/) - Software Developer
- [Caleb So](https://www.linkedin.com/) - Software Developer
- [Farid Rohana](https://www.linkedin.com/) - Software Developer
- [Tyler Kim](https://www.linkedin.com/) - Software Developer
- [Siddharth Balaji](https://www.linkedin.com/) - Software Developer
- [Kayla Tran](https://www.linkedin.com/) - Software Developer
- [Hayes Lao](https://www.linkedin.com/) - Software Developer

## Getting Started And Contributing

### Getting Started

1. Install dependencies from the repository root:

```bash
npm install
```

2. Install app-specific dependencies:

```bash
cd apps/backend
npm install

cd ../frontend
npm install
```

3. Set up environment variables:

- `apps/backend/.env`
  - `MONGO_URI` (required)
  - `TOKEN_SECRET_KEY`
  - `CORS_ORIGIN` (e.g. `http://localhost:3000`)
  - Clerk config values as needed for your project
- `apps/frontend/.env.local`
  - `NEXT_PUBLIC_API_URL=http://localhost:8000`
  - Clerk frontend variables as needed

4. Run the app in development from the repo root:

```bash
npm run dev
```

This starts:

- frontend on `http://localhost:3000`
- backend on `http://localhost:8000`

### Available Scripts

- `npm run dev` — runs frontend and backend concurrently in development.
- `npm run build` — builds the frontend production bundle.
- `npm run start` — starts the production frontend and backend.
- `npm test` — runs tests (backend and/or frontend tests per package configuration).
- `npm run lint` — checks frontend linting.

### Contributing

- Fork the repository or create a local feature branch.
- Keep changes small and focused.
- Run the existing tests before submitting changes.
- Use the existing backend routes and frontend conventions when adding new features.
- When you add environment variables, document them in this README.

If you are contributing code, make sure the app still starts correctly with `npm run dev` and the relevant tests pass.

### Terminal Quick Commands

If you prefer running quick commands from the terminal, use the helper scripts in the `scripts/` folder or run the commands directly.

- Bootstrap the repo (installs dependencies and creates local .env files from examples):

```
./scripts/setup.sh
```

- Start development servers (frontend + backend) from the repo root:

```
./scripts/dev.sh
```

- Build frontend and start production servers:

```
./scripts/start-prod.sh
```

- Run backend or frontend individually:

```
# backend dev
cd apps/backend && npm run dev

# frontend dev
cd apps/frontend && npm run dev
```

Make scripts executable if needed:

```bash
chmod +x scripts/*.sh
```
