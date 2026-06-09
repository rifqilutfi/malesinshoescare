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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ordersService } from "@/services/orders";
import type { Order } from "@/types";

/** Format price number to Rp XX.XXX */
function formatPrice(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return `Rp ${num.toLocaleString('id-ID')}`;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const ordersData = await ordersService.getAll({ limit: 5 });
        setRecentOrders(ordersData.orders || []);
        setTotalOrders(ordersData.pagination?.total || 0);
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-blue-100">Semua pesanan</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
            <Wrench className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentOrders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length}
            </div>
            <p className="text-xs text-purple-100">Orders aktif</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <ShirtIcon className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentOrders.filter(o => o.status === 'COMPLETED').length}
            </div>
            <p className="text-xs text-emerald-100">Orders completed</p>
          </CardContent>
        </Card>
      </div>

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
            <CardDescription>Lihat dan kelola layanan</CardDescription>
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
