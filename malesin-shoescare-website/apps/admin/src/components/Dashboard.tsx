import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShirtIcon, 
  Package,
  Loader2,
  AlertCircle,
  ArrowRight,
  Wrench,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ordersService } from "@/services/orders";
import { analyticsService } from "@/services/analytics";
import type { Order, AnalyticsDashboard } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/** Format price number to Rp XX.XXX */
function formatPrice(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return `Rp ${num.toLocaleString('id-ID')}`;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#eab308',
  PICKUP: '#3b82f6',
  PROCESSING: '#a855f7',
  QC: '#f97316',
  READY: '#22c55e',
  DELIVERY: '#14b8a6',
  COMPLETED: '#059669',
  CANCELLED: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PICKUP: 'Pickup',
  PROCESSING: 'Proses',
  QC: 'QC',
  READY: 'Siap',
  DELIVERY: 'Delivery',
  COMPLETED: 'Selesai',
  CANCELLED: 'Batal',
};

const SERVICE_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const [ordersData, analyticsData] = await Promise.all([
          ordersService.getAll({ limit: 5 }),
          analyticsService.getDashboard(),
        ]);
        
        setRecentOrders(ordersData.orders || []);
        setTotalOrders(ordersData.pagination?.total || 0);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      PENDING: { color: "bg-yellow-500", label: "Pending" },
      PICKUP: { color: "bg-blue-500", label: "Pickup" },
      PROCESSING: { color: "bg-purple-500", label: "Proses" },
      QC: { color: "bg-orange-500", label: "QC" },
      READY: { color: "bg-green-500", label: "Siap" },
      DELIVERY: { color: "bg-teal-500", label: "Delivery" },
      COMPLETED: { color: "bg-emerald-500", label: "Selesai" },
      CANCELLED: { color: "bg-red-500", label: "Batal" }
    };
    
    const statusInfo = statusMap[status] || { color: "bg-gray-500", label: status };
    return <Badge className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  // Prepare chart data
  const statusChartData = analytics?.ordersByStatus.map(item => ({
    name: STATUS_LABELS[item.status] || item.status,
    count: item.count,
    fill: STATUS_COLORS[item.status] || '#94a3b8',
  })) || [];

  const serviceChartData = analytics?.servicePopularity || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Selamat datang di CleanStride Admin Panel</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/dashboard/order')}>
          <Package className="h-4 w-4 mr-2" />
          Order Baru
        </Button>
      </div>

      {/* KPI Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.kpiCards.totalOrders}</div>
              <p className="text-xs text-blue-100 mt-1">Semua pesanan</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <CheckCircle className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.kpiCards.completedOrders}</div>
              <p className="text-xs text-emerald-100 mt-1">Orders completed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimasi Revenue</CardTitle>
              <DollarSign className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatPrice(analytics.kpiCards.revenueEstimate)}</div>
              <p className="text-xs text-purple-100 mt-1">Dari order selesai</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Layanan Terpopuler</CardTitle>
              <Star className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{analytics.kpiCards.mostPopularService}</div>
              <p className="text-xs text-orange-100 mt-1">Paling banyak dipesan</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders by Status */}
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Orders per Status
              </CardTitle>
              <CardDescription>Distribusi status pesanan</CardDescription>
            </CardHeader>
            <CardContent>
              {statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="name"
                      label={({ name, count }) => `${name}: ${count}`}
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <p>Belum ada data</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Popularity */}
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-purple-600" />
                Popularitas Layanan
              </CardTitle>
              <CardDescription>Layanan paling banyak dipesan</CardDescription>
            </CardHeader>
            <CardContent>
              {serviceChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={serviceChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Jumlah Order" radius={[0, 6, 6, 0]}>
                      {serviceChartData.map((_entry, index) => (
                        <Cell key={`bar-${index}`} fill={SERVICE_COLORS[index % SERVICE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <p>Belum ada data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className="bg-white/70 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/dashboard/orders')}
        >
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <Package className="h-5 w-5 mr-2" />
              Kelola Order
            </CardTitle>
            <CardDescription>Lihat dan update status semua order</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Buka <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="bg-white/70 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/dashboard/services')}
        >
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700">
              <Wrench className="h-5 w-5 mr-2" />
              Kelola Layanan
            </CardTitle>
            <CardDescription>Tambah, edit, dan kelola layanan</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Buka <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Order Terbaru</CardTitle>
            <CardDescription>5 pesanan terakhir</CardDescription>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard/orders')}>
            Lihat Semua
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Belum ada order</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate('/dashboard/orders')}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <ShirtIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{order.customer?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <p className="text-sm text-gray-600 mt-1">{formatPrice(order.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
