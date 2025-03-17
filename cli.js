#!/usr/bin/env node

import axios from "axios";
import readline from "readline";
import chalk from "chalk";

const API_URL = "http://localhost:3000/chat";
const threadId = "Brendon"; // Static thread ID for now

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
      threadId,
      message,
    });

    const { text, tools = [] } = response.data.response;

    console.log(tools);
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
