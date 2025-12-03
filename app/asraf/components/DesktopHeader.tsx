export default function DesktopHeader() {
  return (
    <header className="hidden lg:flex w-full h-16 bg-white border-b items-center justify-between px-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="flex items-center gap-4">
        <input 
          className="px-3 py-1 rounded border"
          type="text" 
          placeholder="Search..." 
        />
        <div className="w-10 h-10 bg-gray-300 rounded-full" />
      </div>
    </header>
  );
}
