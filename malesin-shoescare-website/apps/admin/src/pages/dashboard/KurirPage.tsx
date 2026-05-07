import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TruckIcon, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  CheckCircle,
  MapPin,
  Phone,
  ArrowRight
} from "lucide-react";
import { ordersService } from "@/services/orders";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@/types";

const KurirPage = () => {
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get orders that need courier: pending (pickup) and ready (delivery)
      const data = await ordersService.getAll({ per_page: 100 });
      const kurirOrders = (data.data || []).filter((o: Order) => 
        ['pending', 'ready', 'delivery'].includes(o.status)
      );
      setOrders(kurirOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handlePickup = async (order: Order) => {
    try {
      setUpdating(order.id);
      await ordersService.updateStatus(order.id, 'pickup');
      toast({
        title: "Pickup Berhasil",
        description: `${order.order_number} sudah dijemput`,
      });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Gagal mengubah status",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleStartDelivery = async (order: Order) => {
    try {
      setUpdating(order.id);
      await ordersService.updateStatus(order.id, 'delivery');
      toast({
        title: "Delivery Dimulai",
        description: `${order.order_number} sedang diantar`,
      });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Gagal mengubah status",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleComplete = async (order: Order) => {
    try {
      setUpdating(order.id);
      await ordersService.updateStatus(order.id, 'completed');
      toast({
        title: "Selesai!",
        description: `${order.order_number} sudah diterima customer`,
      });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Gagal mengubah status",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const ordersByType = {
    pickup: orders.filter(o => o.status === 'pending'),
    ready: orders.filter(o => o.status === 'ready'),
    delivery: orders.filter(o => o.status === 'delivery'),
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
        <Button variant="outline" className="mt-4" onClick={fetchOrders}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Panel Kurir</h2>
          <p className="text-gray-600">Kelola pickup dan delivery</p>
        </div>
        <Button variant="outline" onClick={fetchOrders}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pickup Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{ordersByType.pickup.length}</div>
            <p className="text-xs text-orange-100">Perlu dijemput</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Siap Antar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{ordersByType.ready.length}</div>
            <p className="text-xs text-green-100">Menunggu delivery</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sedang Diantar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{ordersByType.delivery.length}</div>
            <p className="text-xs text-teal-100">On the way</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pickup */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader className="bg-orange-50 rounded-t-lg">
            <CardTitle className="text-orange-700 flex items-center">
              <TruckIcon className="h-5 w-5 mr-2" />
              Perlu Dijemput
            </CardTitle>
            <CardDescription>Order baru menunggu pickup</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {ordersByType.pickup.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Tidak ada pickup</p>
            ) : (
              <div className="space-y-3">
                {ordersByType.pickup.map(order => (
                  <div key={order.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg">{order.order_number}</p>
                        <p className="font-medium">{order.customer?.name}</p>
                      </div>
                      <Badge className="bg-orange-500 text-white">Pickup</Badge>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                        <span>{order.customer?.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{order.customer?.phone}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handlePickup(order)}
                      disabled={updating === order.id}
                    >
                      {updating === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Sudah Dijemput
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader className="bg-green-50 rounded-t-lg">
            <CardTitle className="text-green-700 flex items-center">
              <TruckIcon className="h-5 w-5 mr-2" />
              Siap Diantar
            </CardTitle>
            <CardDescription>Sepatu sudah selesai, siap delivery</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {ordersByType.ready.length === 0 && ordersByType.delivery.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Tidak ada delivery</p>
            ) : (
              <div className="space-y-3">
                {/* Ready for delivery */}
                {ordersByType.ready.map(order => (
                  <div key={order.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg">{order.order_number}</p>
                        <p className="font-medium">{order.customer?.name}</p>
                      </div>
                      <Badge className="bg-green-500 text-white">Siap</Badge>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                        <span>{order.customer?.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{order.customer?.phone}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-teal-600 hover:bg-teal-700"
                      onClick={() => handleStartDelivery(order)}
                      disabled={updating === order.id}
                    >
                      {updating === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Mulai Antar <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                ))}

                {/* Currently delivering */}
                {ordersByType.delivery.map(order => (
                  <div key={order.id} className="p-4 bg-teal-50 rounded-lg border-2 border-teal-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg">{order.order_number}</p>
                        <p className="font-medium">{order.customer?.name}</p>
                      </div>
                      <Badge className="bg-teal-500 text-white">Sedang Diantar</Badge>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                        <span>{order.customer?.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{order.customer?.phone}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleComplete(order)}
                      disabled={updating === order.id}
                    >
                      {updating === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Selesai Diantar
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KurirPage;
