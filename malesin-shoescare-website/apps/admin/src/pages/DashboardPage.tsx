import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-orange-500 text-black font-bold px-2 py-0.5 text-sm">
              MALESIN
            </div>
            <span className="font-semibold">.ShoeCare Admin</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Hi, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Orders Today', value: '12', color: 'bg-blue-500' },
            { label: 'Revenue Today', value: 'Rp 1.2M', color: 'bg-green-500' },
            { label: 'In Progress', value: '8', color: 'bg-yellow-500' },
            { label: 'Active Customers', value: '156', color: 'bg-purple-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6">
              <div className={`w-10 h-10 ${stat.color} rounded-lg mb-4`}></div>
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'View Orders', icon: '📦' },
              { label: 'Manage Services', icon: '🔧' },
              { label: 'Reports', icon: '📊' },
              { label: 'Settings', icon: '⚙️' },
            ].map((action, i) => (
              <button
                key={i}
                className="p-4 border rounded-lg hover:bg-gray-50 text-center transition-colors"
              >
                <span className="text-2xl mb-2 block">{action.icon}</span>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is the admin skeleton. The full admin panel with all features 
            is available in the existing <code>src/</code> folder. This apps/admin is a fresh start 
            for the monorepo architecture.
          </p>
        </div>
      </main>
    </div>
  );
}
