import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { UserRole } from "./lib/roles.types";

const isPublicRoute = createRouteMatcher([
  "/",
  "/Auth/Login(.*)",
  "/Auth/SignUp(.*)",
  "/forgot-password(.*)",
  "/reset-password(.*)",
  "/About",
  "/ContactUs",
  "/Donate",
]);

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/Auth/Login(.*)", "/Auth/SignUp(.*)"]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isProtectedApiRoute = createRouteMatcher(["/api/admin/promote(.*)", "/api/admin/demote(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata?.role as UserRole | undefined) ?? "user";

  // Not signed in
  if (!userId) {
    if (isPublicRoute(req) || isAuthRoute(req)) return NextResponse.next();
    const signInUrl = new URL("/Auth/Login", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Signed in — redirect away from sign-in/sign-up
  if (isAuthRoute(req)) {
    const home = role === "admin" || role === "mainadmin" ? "/admin" : "/";
    return NextResponse.redirect(new URL(home, req.url));
  }

  // Block /admin routes unless admin or mainadmin
  if (isAdminRoute(req)) {
    if (role !== "admin" && role !== "mainadmin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Block promote/demote API routes unless mainadmin
  if (isProtectedApiRoute(req)) {
    if (role !== "mainadmin") {
      return NextResponse.json({ error: "Forbidden: only the main admin can perform this action." }, { status: 403 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
