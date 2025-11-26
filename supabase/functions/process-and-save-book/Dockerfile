FROM denoland/deno:alpine

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# The port your function will listen on
EXPOSE 8000

# The main command to run when the container starts
CMD ["deno", "run", "--allow-all", "index.ts"]
