# ==============================================================
# SkillSphere Frontend — Multi-Stage Dockerfile
# Stage 1: Build React app with Vite
# Stage 2: Serve static files with Nginx (production-grade)
# Covers CO2: Multi-stage builds, image layering, port mapping
# ==============================================================

# ── Stage 1: Build ────────────────────────────────────────────
FROM node:20-alpine AS builder

LABEL stage="builder"

WORKDIR /app

# Copy dependency manifests first (cache optimization)
COPY package*.json ./

# Install ALL dependencies (including devDeps needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
# ARG allows passing build-time variables (e.g., API URL)
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build
# Output is in /app/dist

# ── Stage 2: Serve with Nginx ──────────────────────────────────
FROM nginx:1.25-alpine AS production

LABEL maintainer="SkillSphere Team"
LABEL version="1.0.0"
LABEL description="SkillSphere Frontend — React + Vite served by Nginx"

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/skillsphere.conf

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# EXPOSE port 80 (Nginx default)
EXPOSE 80

# Nginx runs as its own user — already non-root in official image
# Start Nginx in foreground (daemon off = container stays alive)
CMD ["nginx", "-g", "daemon off;"]
