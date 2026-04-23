// This file must exist for Next.js route validation but home page is in app/page.tsx
// to avoid Navbar/Footer layout issues. This page never renders — app/page.tsx takes precedence.
import { redirect } from "next/navigation";

export default function MarketingRootPage() {
  // This should never execute since app/page.tsx handles "/"
  // but TypeScript requires a valid default export for page files.
  redirect("/");
}
