# Use an official Node.js runtime as a parent image
FROM node:21.5.0-slim

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Bundle the source code inside the Docker image
COPY index.js .

# Run index.js when the container launches
CMD [ "node", "index.js" ]