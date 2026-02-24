import Sidebar from "@/components/Sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Sidebar />
      <main className="min-h-screen p-4 pt-18 md:ml-64 md:p-8 md:pt-8">{children}</main>
    </>
  );
}
