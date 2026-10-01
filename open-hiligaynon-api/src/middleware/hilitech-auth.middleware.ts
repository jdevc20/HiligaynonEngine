import { createHmac, timingSafeEqual } from "crypto";
import type { NextFunction, Request, Response } from "express";

export type HilitechRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export interface HilitechPrincipal {
  identityId: string;
  email: string;
  role: HilitechRole;
}

export interface HilitechRequest extends Request {
  hilitechUser?: HilitechPrincipal;
}

type JwtHeader = {
  alg?: string;
  typ?: string;
};

type JwtPayload = {
  sub?: string;
  email?: string;
  role?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
};

const ROLES = new Set<HilitechRole>(["USER", "ADMIN", "SUPER_ADMIN"]);

const decodeJson = <T>(part: string): T => {
  const json = Buffer.from(part, "base64url").toString("utf8");
  return JSON.parse(json) as T;
};

const audienceMatches = (actual: string | string[] | undefined, expected: string) => {
  if (typeof actual === "string") return actual === expected;
  return Array.isArray(actual) && actual.includes(expected);
};

export const verifyHilitechAccessToken = (token: string): HilitechPrincipal => {
  const secret = process.env.HILITECH_JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("HILITECH_JWT_ACCESS_SECRET is not configured.");
  }

  const issuer = process.env.HILITECH_JWT_ISSUER || "hilitech-auth-service";
  const audience = process.env.HILITECH_JWT_AUDIENCE || "hilitech-apps";

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed access token.");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJson<JwtHeader>(encodedHeader);
  const payload = decodeJson<JwtPayload>(encodedPayload);

  if (header.alg !== "HS256") {
    throw new Error("Unsupported access-token algorithm.");
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();
  const actualSignature = Buffer.from(encodedSignature, "base64url");

  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    throw new Error("Invalid access-token signature.");
  }

  const now = Math.floor(Date.now() / 1000);

  if (typeof payload.exp !== "number" || payload.exp <= now) {
    throw new Error("Access token has expired.");
  }

  if (typeof payload.nbf === "number" && payload.nbf > now) {
    throw new Error("Access token is not active yet.");
  }

  if (payload.iss !== issuer) {
    throw new Error("Invalid access-token issuer.");
  }

  if (!audienceMatches(payload.aud, audience)) {
    throw new Error("Invalid access-token audience.");
  }

  if (
    typeof payload.sub !== "string" ||
    !payload.sub ||
    typeof payload.email !== "string" ||
    !ROLES.has(payload.role as HilitechRole)
  ) {
    throw new Error("Access token is missing required Hilitech claims.");
  }

  return {
    identityId: payload.sub,
    email: payload.email,
    role: payload.role as HilitechRole,
  };
};

export const optionalHilitechAuth = (
  req: HilitechRequest,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next();
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      error: "Authentication failed",
      details: "Authorization must use a Bearer access token.",
    });
  }

  try {
    req.hilitechUser = verifyHilitechAccessToken(token);
    return next();
  } catch (error: any) {
    const configurationError =
      error?.message === "HILITECH_JWT_ACCESS_SECRET is not configured.";

    return res.status(configurationError ? 500 : 401).json({
      error: configurationError ? "Authentication is not configured" : "Authentication failed",
      details: error?.message || "The Hilitech access token is invalid.",
    });
  }
};

export const requireHilitechAuth = (
  req: HilitechRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.hilitechUser) {
    return res.status(401).json({
      error: "Authentication required",
      details: "Sign in with Hilitech Authentication to perform this action.",
    });
  }

  return next();
};

export const requireHilitechAdmin = (
  req: HilitechRequest,
  res: Response,
  next: NextFunction
) => {
  const role = req.hilitechUser?.role;

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return res.status(403).json({
      error: "Admin permission required",
      details: "Only Hilitech ADMIN or SUPER_ADMIN accounts may perform this action.",
    });
  }

  return next();
};
