export default function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex w-64 h-screen bg-gray-100 border-r p-6 flex-col">
      <h2 className="text-2xl font-bold mb-8">MyApp</h2>

      <nav className="flex flex-col gap-4 text-gray-700">
        <a className="hover:text-black" href="/dashboard">Dashboard</a>
        <a className="hover:text-black" href="/dashboard/tasks">Tasks</a>
        <a className="hover:text-black" href="/dashboard/profile">Profile</a>
        <a className="hover:text-black" href="/dashboard/settings">Settings</a>
      </nav>
    </aside>
  );
}
