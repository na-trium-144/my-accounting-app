# Dockerfile

# 1. Builder Stage: Build the Next.js application
FROM node:alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the Next.js application
# This will generate the .next/standalone directory because of the 'standalone' output config
RUN npm run build

# 2. Runner Stage: Create the final, lean production image
FROM node:alpine AS runner

WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production
# The Next.js server will run on this port. Default is 3000.
ENV PORT=3000

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# Copy the standalone output from the builder stage
COPY --from=builder /app/.next/standalone ./
# Copy the public and static assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Create a non-root user for security
# The user needs ownership of the .next directory to run the app
RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nextjs /app/.next
USER nextjs

# Expose the port the app will run on
# EXPOSE 3000

# The command to start the application
# This will run the server.js file in the .next/standalone directory
CMD ["node", "server.js"]
