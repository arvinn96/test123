# Test123

Simple Node.js (Express) web app used to test the GitHub → Railway deployment pipeline.

## Endpoints

| Path | Purpose |
|---|---|
| `/` | Status page |
| `/health` | Health check (used by Railway) |
| `/api/info` | Runtime information (Node version, environment, server time) |
| `GET /api/counter` · `POST /api/counter/increment` · `POST /api/counter/reset` | Counter |
| `GET /api/tasks` · `POST /api/tasks` · `PATCH /api/tasks/:id` · `DELETE /api/tasks/:id` | Task list (add, toggle done, delete) |
| `GET /api/tip` | Random digital transformation tip |

Data is held in server memory and resets when the service restarts or redeploys.

## Run locally

```bash
npm install
npm start      # http://localhost:3000
npm test
```

## Deployment

Deployed on Railway from the `main` branch. Railway sets `PORT` automatically; the health check path is `/health`.
