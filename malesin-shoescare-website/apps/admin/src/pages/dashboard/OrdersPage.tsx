import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Search, 
  Package, 
  Loader2, 
  AlertCircle,
  Eye,
  ChevronDown,
  RefreshCw,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ordersService } from "@/services/orders";
import { useToast } from "@/hooks/use-toast";
import type { Order, OrderStatus } from "@/types";

const statusOptions = [
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "pickup", label: "Pickup", color: "bg-blue-500" },
  { value: "processing", label: "Proses", color: "bg-purple-500" },
  { value: "qc", label: "Quality Control", color: "bg-orange-500" },
  { value: "ready", label: "Siap Antar", color: "bg-green-500" },
  { value: "delivery", label: "Delivery", color: "bg-teal-500" },
  { value: "completed", label: "Selesai", color: "bg-emerald-500" },
  { value: "cancelled", label: "Batal", color: "bg-red-500" },
];

const OrdersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { per_page: 50 };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      
      const data = await ordersService.getAll(params);
      setOrders(data.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      setUpdating(true);
      await ordersService.updateStatus(orderId, newStatus as OrderStatus);
      toast({
        title: "Status Diperbarui",
        description: `Order berhasil diubah ke ${statusOptions.find(s => s.value === newStatus)?.label}`,
      });
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error('Failed to update status:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Gagal mengubah status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      order.order_number?.toLowerCase().includes(search) ||
      order.customer?.name?.toLowerCase().includes(search) ||
      order.customer?.phone?.includes(search)
    );
  });

  const getStatusBadge = (status: string) => {
    const statusInfo = statusOptions.find(s => s.value === status);
    return (
      <Badge className={`${statusInfo?.color || 'bg-gray-500'} text-white`}>
        {statusInfo?.label || status}
      </Badge>
    );
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
          <h2 className="text-3xl font-bold text-gray-900">Semua Order</h2>
          <p className="text-gray-600">Kelola dan update status pesanan</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/dashboard/order')}>
            <Package className="h-4 w-4 mr-2" />
            Order Baru
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari order number, nama, atau telepon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Daftar Order ({filteredOrders.length})
          </CardTitle>
          <CardDescription>Klik order untuk melihat detail dan update status</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada order ditemukan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-gray-600">{order.customer?.name}</p>
                      <p className="text-xs text-gray-500">{order.customer?.phone}</p>
                    </div>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="font-medium">{order.service?.name}</p>
                    <p className="text-sm text-gray-600">{order.quantity} sepatu</p>
                  </div>
                  <div className="text-center hidden lg:block">
                    <p className="font-bold text-green-600">{order.total_formatted}</p>
                    <p className="text-xs text-gray-500">{order.created_at}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(order.status)}
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Order {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>
              Update status pesanan
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{selectedOrder.customer?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telepon</p>
                  <p className="font-medium">{selectedOrder.customer?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Layanan</p>
                  <p className="font-medium">{selectedOrder.service?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-medium text-green-600">{selectedOrder.total_formatted}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Alamat</p>
                  <p className="font-medium">{selectedOrder.customer?.address}</p>
                </div>
                {selectedOrder.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Catatan</p>
                    <p className="font-medium">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Photos Gallery */}
              {selectedOrder.photos && selectedOrder.photos.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Foto Sepatu ({selectedOrder.photos.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedOrder.photos.map((photo, index) => (
                      <a 
                        key={photo.id || index} 
                        href={photo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img 
                          src={photo.url} 
                          alt={`Foto ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border hover:border-blue-500 transition-colors"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Status Saat Ini</p>
                <div className="mb-4">{getStatusBadge(selectedOrder.status)}</div>
                
                <p className="text-sm text-gray-500 mb-2">Ubah Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map(status => (
                    <Button
                      key={status.value}
                      variant={selectedOrder.status === status.value ? "default" : "outline"}
                      size="sm"
                      disabled={updating || selectedOrder.status === status.value}
                      onClick={() => handleStatusUpdate(selectedOrder.id, status.value)}
                      className="justify-start"
                    >
                      {updating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <div className={`w-2 h-2 rounded-full mr-2 ${status.color}`} />
                      )}
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            {selectedOrder && !['processing', 'qc', 'delivery'].includes(selectedOrder.status) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={deleting}>
                    {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Hapus Order
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Order?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus order {selectedOrder.order_number}? 
                      Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={async () => {
                        try {
                          setDeleting(true);
                          await ordersService.delete(selectedOrder.id);
                          toast({
                            title: "Order Dihapus",
                            description: `Order ${selectedOrder.order_number} berhasil dihapus`,
                          });
                          setSelectedOrder(null);
                          fetchOrders();
                        } catch (err) {
                          toast({
                            title: "Error",
                            description: err instanceof Error ? err.message : "Gagal menghapus order",
                            variant: "destructive",
                          });
                        } finally {
                          setDeleting(false);
                        }
                      }}
                    >
                      Ya, Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
