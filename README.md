# AgentMesh API

Public API for AgentMesh trust verification and governance services.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/imran-siddique/agentmesh-api)

## Overview

This API enables AI agents to:
- Register with the AgentMesh network
- Perform cryptographic trust handshakes
- Verify other agents' trust scores
- Query audit logs

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api` | Health check and stats |
| `POST` | `/api/register` | Register a new agent |
| `GET` | `/api/verify/:did` | Verify an agent's status |
| `POST` | `/api/handshake` | Perform trust handshake |
| `GET` | `/api/score/:did` | Get detailed trust score |
| `GET` | `/api/audit/:did` | Query audit log |

## Quick Start

### Register an Agent

```bash
curl -X POST https://agentmesh-api.vercel.app/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MyAgent",
    "sponsor_email": "owner@example.com",
    "capabilities": ["read", "write"]
  }'
```

### Verify an Agent

```bash
curl https://agentmesh-api.vercel.app/api/verify/did:mesh:abc123
```

### Trust Handshake

```bash
curl -X POST https://agentmesh-api.vercel.app/api/handshake \
  -H "Content-Type: application/json" \
  -d '{
    "agent_did": "did:mesh:abc123",
    "challenge": "random_challenge",
    "capabilities_requested": ["read", "execute"]
  }'
```

## Development

```bash
# Install dependencies
npm install

# Run locally
vercel dev

# Deploy
vercel deploy
```

## Environment Variables

For production deployment, configure:

- `KV_REST_API_URL` - Vercel KV endpoint
- `KV_REST_API_TOKEN` - Vercel KV token

Without these, the API uses in-memory storage (data resets on redeploy).

## Architecture

```
agentmesh-api/
├── api/                  # Vercel serverless functions
│   ├── index.ts          # Health check
│   ├── register.ts       # Agent registration
│   ├── verify.ts         # Agent verification
│   ├── handshake.ts      # Trust handshakes
│   ├── score.ts          # Trust scores
│   └── audit.ts          # Audit logs
├── lib/                  # Shared libraries
│   ├── types.ts          # TypeScript types
│   ├── storage.ts        # Vercel KV / memory storage
│   ├── crypto.ts         # Cryptographic operations
│   └── trust.ts          # Trust score calculations
└── public/               # Static files
    ├── skill.md          # Moltbook skill definition
    └── heartbeat.md      # Status page
```

## Related Projects

- [agent-mesh](https://github.com/imran-siddique/agent-mesh) - Core AgentMesh Python library
- [agent-os](https://github.com/Azure/agent-os) - Agent Operating System kernel
- [agentic-architecture](https://github.com/imran-siddique/agentic-architecture) - Architecture documentation

## License

MIT
