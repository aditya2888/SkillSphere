# ==============================================================
# SkillSphere Backend — Multi-Stage Dockerfile
# Covers CO1 & CO2: Container layers, image building, best practices
# ==============================================================

# ── Stage 1: dependency install (cached layer) ─────────────────
FROM node:20-alpine AS deps

# WORKDIR instruction (Unit II) — sets working directory inside container
WORKDIR /app

# COPY only manifests first — Docker caches this layer if deps haven't changed
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev

# ── Stage 2: production image ──────────────────────────────────
FROM node:20-alpine AS production

# Metadata labels (best practice)
LABEL maintainer="SkillSphere Team"
LABEL version="1.0.0"
LABEL description="SkillSphere Backend API — Node.js + Express"

WORKDIR /app

# Copy production node_modules from deps stage (multi-stage build)
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Create uploads directory for local fallback (when Azure not configured)
RUN mkdir -p uploads

# ENV instruction — set defaults (can be overridden at runtime)
ENV NODE_ENV=production
ENV PORT=5000

# EXPOSE instruction — documents the port the container listens on
EXPOSE 5000

# Create a non-root user for security (DevOps best practice)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# ENTRYPOINT + CMD pattern: entrypoint is fixed, cmd is overridable
ENTRYPOINT ["node"]
CMD ["index.js"]
