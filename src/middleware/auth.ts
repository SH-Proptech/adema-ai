import { NextFunction, Request, Response } from "express";
import { expressjwt, GetVerificationKey } from "express-jwt";
import jwksRsa from "jwks-rsa"; // Fetch Auth0 keys
import basicAuth from "basic-auth"; // Middleware for Basic Auth
import { config } from "@config/env";

const secret: GetVerificationKey = jwksRsa.expressJwtSecret({
  cache: true,
  rateLimit: true,
  jwksUri: `https://${config.AUTH0_DOMAIN}/.well-known/jwks.json`,
}) as unknown as GetVerificationKey;

const checkJwt = expressjwt({
  secret,
  audience: config.AUTH0_AUDIENCE,
  issuer: `https://${config.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
});

console.log({
  audience: config.AUTH0_AUDIENCE,
  issuer: `https://${config.AUTH0_DOMAIN}/`,
});

// Basic Authentication Middleware
const checkBasicAuth = (req: Request, res: Response, next: NextFunction) => {
  const credentials = basicAuth(req);

  if (
    !credentials ||
    credentials.name !== config.AUTH0_BASIC_CLIENT_ID ||
    credentials.pass !== config.AUTH0_BASIC_CLIENT_SECRET
  ) {
    res.set("WWW-Authenticate", 'Basic realm="Adema API"');
    return res.status(401).send("Unauthorized");
  }

  next();
};

// Middleware to check either JWT or Basic Auth
const authMiddleware =
  () => (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization?.startsWith("Bearer ")) {
      checkJwt(req, res, (err?: any) => {
        if (err) {
          return res.status(401).json({ message: "Invalid token" });
        }
        next();
      });
    } else {
      checkBasicAuth(req, res, next);
    }
  };

export { authMiddleware };
