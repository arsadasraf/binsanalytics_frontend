import DesktopSidebar from "./components/DesktopSidebar";
import DesktopHeader from "./components/DesktopHeader";
import MobileTabBar from "./components/MobileTabBar";
import MobileHeader from "./components/MobileHeader";

export default function DashboardLayout({ children }: any) {
  return (
    <div className="flex min-h-screen">
      
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      <div className="flex-1 flex flex-col bg-gray-50">
        
        {/* Mobile Header */}
        <MobileHeader />

        {/* Desktop Header */}
        <DesktopHeader />

        {/* Page Content */}
        <main className="flex-1 p-4 pb-20 lg:pb-4">
          {children}
        </main>

        {/* Mobile Bottom Tab */}
        <MobileTabBar />
      </div>
    </div>
  );
}
