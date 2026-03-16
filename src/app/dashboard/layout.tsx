import { NavigationBar } from "@/components/shared/NavigationBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-foam">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex min-h-screen">
          <NavigationBar />
          <main className="flex-1 px-4 pb-24 pt-8 lg:pb-8 lg:pl-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
