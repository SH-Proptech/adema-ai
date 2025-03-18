#!/usr/bin/env node

const axios = require("axios");
const readline = require("readline");
const chalk = require("chalk");

const threadId = "Brendon"; // Static thread ID for now
const API_URL = "http://localhost:8181/thread/" + threadId;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(
  chalk.cyan("🤖 Adema:"),
  "Hey! How can I help you today? (type 'exit' to quit)"
);

async function sendMessage(message) {
  try {
    const response = await axios.post(API_URL, {
      message,
    });

    const { text, tools = [] } = response.data.response;

    console.log("-----------------");
    console.log(tools[tools.length - 1]);

    console.log(chalk.cyan("\n🤖 Adema:"), ` ${text}\n`);
  } catch (error) {
    console.error("\n❌ Error:", error.response?.data || error.message);
  }
}

function askQuestion() {
  rl.question(chalk.yellow(`\n🤓 ${threadId}: `), async (input) => {
    if (input.toLowerCase() === "exit") {
      console.log("👋 Goodbye!");
      rl.close();
      return;
    }

    await sendMessage(input);
    askQuestion();
  });
}

askQuestion();
