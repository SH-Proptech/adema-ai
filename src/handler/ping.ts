import { Request, Response } from "express";

const ping = (req: Request, res: Response): void => {
  req.log.debug("/ping");
  res.send("Pong!");
};

export { ping };
