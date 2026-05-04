export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: import("../../../backend/lib/roles.types").UserRole;
    };
  }
}
