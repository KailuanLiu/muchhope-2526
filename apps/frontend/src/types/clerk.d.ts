export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: import("../lib/roles.types").UserRole;
    };
  }
}
