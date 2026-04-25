import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Public routes — anything not matched here requires a Clerk-authenticated user.
 * The admin gate (`profiles.role = 'admin'` equivalent, i.e. ADMIN_USER_IDS) is
 * enforced in `lib/admin.ts::requireAdmin()` and by each admin layout/page.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/about(.*)",
  "/services(.*)",
  "/cours(.*)",
  "/team(.*)",
  "/blog(.*)",
  "/contact(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/verify(.*)",
  // Auth (French + legacy English kept for backwards compatibility during migration)
  "/connexion(.*)",
  "/inscription(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  // Public API endpoints
  "/api/contact(.*)",
  "/api/newsletter(.*)",
  "/api/courses(.*)",
  "/api/lessons(.*)",
  "/api/webhooks(.*)",
  // Legacy English course paths (redirected in next.config)
  "/courses(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect({ unauthenticatedUrl: new URL("/connexion", req.url).toString() });
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
