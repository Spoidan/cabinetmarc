import { auth } from "@clerk/nextjs/server";
import { isAdminUser } from "@/lib/admin";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default async function ElearningLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const isAdmin = await isAdminUser(userId);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isAdmin={isAdmin} />
      <main className="flex-1 pt-16 lg:pt-20">{children}</main>
      <Footer />
    </div>
  );
}
