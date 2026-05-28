import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#F8F5F0] min-h-screen">
      <Sidebar />
      <MobileNav />

      <main className="lg:ml-64 p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;