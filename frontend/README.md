# PupiGo frontend

React 19 + Vite + Tailwind CSS. Views: `/` (student) and `/conductor` (driver). Start the backend first (see the root `README.md`).

## Scripts

```bash
npm install
npm run dev        # development server on http://localhost:5173
npm run build      # production build in dist/
npm run lint       # oxlint
npm run preview    # serves the build locally
```

If port 5173 is in use, Vite takes the next free one and shows it in the terminal.

## Environment variable

Optional `frontend/.env` (see `.env.example`):

| Variable | Default | Use |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api` | Base URL of the backend API |
