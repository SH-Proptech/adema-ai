import { ask } from "./langchain"; // Import LangGraph agent
import chalk from "chalk";
import readlineSync from "readline-sync";

const adema = chalk.cyan("\n🤖 Adema: ");
const me = chalk.yellow("\n🤓 Brendon: ");

// Function to handle user input
async function chat(threadId: string): Promise<void> {
  console.log(adema, "👋 Hello!");

  while (true) {
    const userInput: string = await readlineSync.question(me);
    if (userInput.toLowerCase() === "exit") {
      console.log(adema, "👋 Goodbye!");
      break;
    }

    const response = await ask(threadId, userInput);
    displayResponse(response);
  }
}

function displayResponse(response: any) {
  if (response) {
    console.log(adema, response);
  } else {
    console.log(adema, "I'm sorry, I don't understand");
  }
}

chat("user-session-1");
