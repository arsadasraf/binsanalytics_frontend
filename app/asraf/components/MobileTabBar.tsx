import { Home, List, User, Settings } from "lucide-react";

export default function MobileTabBar() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg flex justify-around py-2 z-50">
      <a href="/dashboard" className="flex flex-col items-center">
        <Home size={22} />
        <span className="text-xs">Home</span>
      </a>

      <a href="/dashboard/tasks" className="flex flex-col items-center">
        <List size={22} />
        <span className="text-xs">Tasks</span>
      </a>

      <a href="/dashboard/profile" className="flex flex-col items-center">
        <User size={22} />
        <span className="text-xs">Profile</span>
      </a>

      <a href="/dashboard/settings" className="flex flex-col items-center">
        <Settings size={22} />
        <span className="text-xs">Settings</span>
      </a>
    </nav>
  );
}
