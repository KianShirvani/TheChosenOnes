# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code (React app)
COPY . .

# Expose the development port (default React port)
EXPOSE 3000

# Start the development server (this will run "npm start")
CMD ["npm", "start"]