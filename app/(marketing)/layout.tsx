import { auth } from "@clerk/nextjs/server";
import { isAdminUser } from "@/lib/admin";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const isAdmin = await isAdminUser(userId);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isAdmin={isAdmin} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
