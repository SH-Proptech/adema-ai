# Use Node image as the base image (make sure it's a version that fits your needs)
FROM node:23-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of your source code into the container
COPY . .

# Expose the port your app will run on (adjust the port if needed)
EXPOSE 8080

# Run the development server with hot reload (npm run dev starts everything)
CMD ["npm", "run", "dev"]