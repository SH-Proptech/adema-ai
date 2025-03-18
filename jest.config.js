module.exports = {
  transform: {
    "^.+\\.(t|j)s$": "@swc/jest", // Use SWC for `.ts` and `.js` files
  },
  testEnvironment: "node", // Set the environment to node (since you're running a Node.js app)
  moduleFileExtensions: ["ts", "js"], // Recognize `.ts` and `.js` files for testing
  preset: "ts-jest", // Use ts-jest preset for TypeScript support
};
