import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/auth/(.*)",
  "/Events/Upcoming",
  "/Events/PastEvents",
  "/Events/(.*)",
  "/About",
  "/ContactUs",
  "/Donate",
  "/api/events(.*)",
  "/api/shifts(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
