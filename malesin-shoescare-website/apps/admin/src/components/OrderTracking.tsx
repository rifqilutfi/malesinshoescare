
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Package, TruckIcon, Wrench, CheckCircle, Clock, MapPin, Phone, Loader2, AlertCircle } from "lucide-react";
import { ordersService } from "@/services/orders";
import type { Order } from "@/types";

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchOrderId, setSearchOrderId] = useState(searchParams.get('order') || "");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Auto-search if order param is in URL
  useEffect(() => {
    const orderParam = searchParams.get('order');
    if (orderParam) {
      setSearchOrderId(orderParam);
      handleSearch(orderParam);
    }
  }, []);

  const handleSearch = async (orderNumber?: string) => {
    const searchTerm = orderNumber || searchOrderId.trim();
    if (!searchTerm) return;
    
    try {
      setLoading(true);
      setError(null);
      setSearched(true);
      
      const order = await ordersService.getByOrderNumber(searchTerm.toUpperCase());
      setSelectedOrder(order);
      
    } catch (err) {
      console.error('Failed to search order:', err);
      setError(err instanceof Error ? err.message : 'Gagal mencari order');
      setSelectedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-500",
      pickup: "bg-blue-500",
      processing: "bg-purple-500",
      qc: "bg-orange-500",
      ready: "bg-green-500",
      delivery: "bg-teal-500",
      completed: "bg-emerald-500",
      cancelled: "bg-red-500"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getStatusIcon = (step: string) => {
    const icons: Record<string, typeof Package> = {
      "Order Received": Package,
      "Pickup": TruckIcon,
      "Processing": Wrench,
      "Quality Control": CheckCircle,
      "Ready for Delivery": Clock,
      "Delivered": CheckCircle
    };
    return icons[step] || Package;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Lacak Pesanan</h2>
        <p className="text-gray-600">Masukkan nomor order untuk melihat status terkini</p>
      </div>

      {/* Search Order */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Cari Pesanan
          </CardTitle>
          <CardDescription>Masukkan nomor order (contoh: CLS-20241212-001)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex space-x-4">
            <Input
              placeholder="Masukkan nomor order..."
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              className="flex-1"
              disabled={loading}
            />
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Cari
                </>
              )}
            </Button>
          </form>
          {error && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
            </p>
          )}
          {searched && !loading && !selectedOrder && !error && (
            <p className="text-red-500 text-sm mt-2">Order tidak ditemukan. Pastikan nomor order benar.</p>
          )}
        </CardContent>
      </Card>

      {/* Order Details */}
      {selectedOrder && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">Order {selectedOrder.order_number}</CardTitle>
                    <CardDescription className="flex items-center mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {selectedOrder.customer?.address}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(selectedOrder.status)} text-white`}>
                    {selectedOrder.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium">{selectedOrder.customer?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telepon</p>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <p className="font-medium">{selectedOrder.customer?.phone}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Layanan</p>
                    <p className="font-medium">{selectedOrder.service?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estimasi Selesai</p>
                    <p className="font-medium">{selectedOrder.estimated_completion || 'Segera'}</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium">{selectedOrder.progress}%</span>
                  </div>
                  <Progress value={selectedOrder.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Timeline Pesanan</CardTitle>
                <CardDescription>Riwayat proses pesanan Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {selectedOrder.timeline?.map((item, index) => {
                    const Icon = getStatusIcon(item.step);
                    const currentStep = selectedOrder.timeline?.findIndex(t => !t.completed) ?? -1;
                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          item.completed 
                            ? 'bg-green-100 text-green-600' 
                            : index === currentStep
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              item.completed ? 'text-green-600' : 'text-gray-900'
                            }`}>
                              {item.step}
                            </p>
                            {item.completed_at && (
                              <p className="text-xs text-gray-500">{item.completed_at}</p>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shoe Details */}
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Detail Sepatu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Jenis</p>
                  <p className="font-medium">{selectedOrder.shoe_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jumlah</p>
                  <p className="font-medium">{selectedOrder.quantity} sepatu</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-medium text-lg">{selectedOrder.total_formatted}</p>
                </div>
                {selectedOrder.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Catatan</p>
                    <p className="font-medium text-sm">{selectedOrder.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Butuh Bantuan?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Hubungi Customer Service
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TruckIcon className="h-4 w-4 mr-2" />
                  Hubungi Kurir
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/dashboard/order')}
                >
                  Pesan Lagi
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedOrder && !loading && !searched && (
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Tips Pencarian</CardTitle>
            <CardDescription>
              Masukkan nomor order yang Anda terima saat membuat pesanan (format: CLS-XXXXXXXX-XXX)
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default OrderTracking;
