import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { ordersService } from "@/services/orders";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@/types";

const WorkshopPage = () => {
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
      
      // Get orders that are in workshop stages: pickup, processing, qc
      const data = await ordersService.getAll({ per_page: 100 });
      const workshopOrders = (data.data || []).filter((o: Order) => 
        ['pickup', 'processing', 'qc'].includes(o.status)
      );
      setOrders(workshopOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const flow: Record<string, string> = {
      'pickup': 'processing',
      'processing': 'qc',
      'qc': 'ready',
    };
    return flow[currentStatus] || null;
  };

  const getNextStatusLabel = (currentStatus: string): string => {
    const labels: Record<string, string> = {
      'pickup': 'Mulai Proses',
      'processing': 'Selesai → QC',
      'qc': 'Lolos QC → Siap Antar',
    };
    return labels[currentStatus] || 'Update';
  };

  const handleUpdateStatus = async (order: Order) => {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return;
    
    try {
      setUpdating(order.id);
      await ordersService.updateStatus(order.id, nextStatus);
      toast({
        title: "Status Diperbarui",
        description: `${order.order_number} berhasil diupdate`,
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pickup': 'bg-blue-500',
      'processing': 'bg-purple-500',
      'qc': 'bg-orange-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pickup': 'Sudah Dijemput',
      'processing': 'Sedang Dicuci',
      'qc': 'Quality Control',
    };
    return labels[status] || status;
  };

  const ordersByStatus = {
    pickup: orders.filter(o => o.status === 'pickup'),
    processing: orders.filter(o => o.status === 'processing'),
    qc: orders.filter(o => o.status === 'qc'),
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
          <h2 className="text-3xl font-bold text-gray-900">Panel Workshop</h2>
          <p className="text-gray-600">Kelola proses pencucian dan quality control</p>
        </div>
        <Button variant="outline" onClick={fetchOrders}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Antrian Proses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{ordersByStatus.pickup.length}</div>
            <p className="text-xs text-blue-100">Menunggu dicuci</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sedang Dicuci</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{ordersByStatus.processing.length}</div>
            <p className="text-xs text-purple-100">Dalam proses</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quality Control</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{ordersByStatus.qc.length}</div>
            <p className="text-xs text-orange-100">Pengecekan kualitas</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Lists by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Antrian Proses */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader className="bg-blue-50 rounded-t-lg">
            <CardTitle className="text-blue-700 flex items-center">
              <Wrench className="h-5 w-5 mr-2" />
              Antrian Proses
            </CardTitle>
            <CardDescription>Sudah dijemput, siap dicuci</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {ordersByStatus.pickup.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Tidak ada antrian</p>
            ) : (
              <div className="space-y-3">
                {ordersByStatus.pickup.map(order => (
                  <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-gray-600">{order.customer?.name}</p>
                      </div>
                      <Badge className="bg-blue-500 text-white">{order.service?.name}</Badge>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleUpdateStatus(order)}
                      disabled={updating === order.id}
                    >
                      {updating === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Mulai Proses <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sedang Dicuci */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader className="bg-purple-50 rounded-t-lg">
            <CardTitle className="text-purple-700 flex items-center">
              <Wrench className="h-5 w-5 mr-2" />
              Sedang Dicuci
            </CardTitle>
            <CardDescription>Proses pencucian</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {ordersByStatus.processing.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Tidak ada proses</p>
            ) : (
              <div className="space-y-3">
                {ordersByStatus.processing.map(order => (
                  <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-gray-600">{order.customer?.name}</p>
                      </div>
                      <Badge className="bg-purple-500 text-white">{order.service?.name}</Badge>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      onClick={() => handleUpdateStatus(order)}
                      disabled={updating === order.id}
                    >
                      {updating === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Selesai → QC <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quality Control */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader className="bg-orange-50 rounded-t-lg">
            <CardTitle className="text-orange-700 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Quality Control
            </CardTitle>
            <CardDescription>Pengecekan kualitas</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {ordersByStatus.qc.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Tidak ada QC</p>
            ) : (
              <div className="space-y-3">
                {ordersByStatus.qc.map(order => (
                  <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-gray-600">{order.customer?.name}</p>
                      </div>
                      <Badge className="bg-orange-500 text-white">{order.service?.name}</Badge>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleUpdateStatus(order)}
                      disabled={updating === order.id}
                    >
                      {updating === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Lolos QC <CheckCircle className="h-4 w-4 ml-2" />
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

export default WorkshopPage;
