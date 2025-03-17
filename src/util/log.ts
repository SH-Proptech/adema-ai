import chalk from "chalk";

export const log = (msg: any) => console.log(chalk.grey(msg));
export const err = (msg: any) => console.log(chalk.red(msg));
export const adema = (threadId: string, msg: any) =>
  console.log(chalk.cyan(`adema[${threadId}]:`, JSON.stringify(msg)));
export const user = (threadId: string, msg: any) =>
  console.log(chalk.yellow(`user[${threadId}]:`, msg));
