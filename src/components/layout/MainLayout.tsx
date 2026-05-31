import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import DarkModeToggle from "../DarkModeToggle";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#F8F5F0] dark:bg-slate-900 text-gray-900 dark:text-slate-100 min-h-screen relative transition-colors duration-200">
      <Sidebar />
      <MobileNav />

      <main className="lg:ml-64 p-4 lg:p-8 relative">
        <div className="absolute top-4 right-4 lg:top-8 lg:right-8 z-50">
          <DarkModeToggle />
        </div>
        {children}
      </main>
    </div>
  );
}

export default MainLayout;