import Navigation from "../../features/navigation/components/Navigation";

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <Navigation />
      <main className="flex-1 px-2 pb-16 sm:pb-0 sm:pl-16 sm:px-12 lg:px-32 xl:px-48 2xl:px-64 max-w-screen-2xl mx-auto">
        {children}
      </main>
    </div>
  );
}
