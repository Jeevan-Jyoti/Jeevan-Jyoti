import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/sign-in(.)", "/sign-up(.)", "/unauthorized"],
});

export const config = {
  matcher: ["/((?!_next|...).*)"],
};
