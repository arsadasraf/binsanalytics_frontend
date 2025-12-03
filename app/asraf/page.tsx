export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Welcome back! 👋</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* Card 1 */}
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold">Today's Tasks</h3>
          <p className="text-gray-600 mt-2">You have 5 pending tasks.</p>
        </div>

        {/* Card 2 */}
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold">Attendance</h3>
          <p className="text-gray-600 mt-2">Present: 18, Absent: 2</p>
        </div>

        {/* Card 3 */}
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold">Machine Health</h3>
          <p className="text-gray-600 mt-2">All machines running normally.</p>
        </div>

      </div>

      {/* Recent Activity */}
      <div className="mt-6 p-4 bg-white rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
        <ul className="text-gray-700 list-disc pl-6 space-y-1">
          <li>Employee #102 marked attendance</li>
          <li>Machine #3 maintenance completed</li>
          <li>New task assigned to Team A</li>
        </ul>
      </div>
    </div>
  );
}
