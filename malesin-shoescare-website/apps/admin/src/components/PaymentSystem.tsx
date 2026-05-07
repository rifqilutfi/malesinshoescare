
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Building, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  DollarSign,
  TrendingUp,
  Loader2
} from "lucide-react";
import { transactionsService } from "@/services/transactions";
import { reportsService } from "@/services/reports";
import type { Transaction, DashboardStats } from "@/types";

const PaymentSystem = () => {
  const [selectedPayment, setSelectedPayment] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentMethods = [
    {
      id: "cod",
      name: "Cash on Delivery (COD)",
      description: "Bayar tunai saat sepatu diantar",
      icon: Banknote,
      fee: 0,
      available: true
    },
    {
      id: "transfer",
      name: "Transfer Bank",
      description: "Transfer ke rekening CleanStride",
      icon: Building,
      fee: 0,
      available: true
    },
    {
      id: "ewallet",
      name: "E-Wallet",
      description: "GoPay, OVO, DANA, LinkAja",
      icon: Smartphone,
      fee: 2500,
      available: true
    },
    {
      id: "credit",
      name: "Kartu Kredit/Debit",
      description: "Visa, Mastercard, JCB",
      icon: CreditCard,
      fee: "2.9%",
      available: false
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [transactionsData, statsData] = await Promise.all([
        transactionsService.getAll({ per_page: 10 }),
        reportsService.getDashboardStats(),
      ]);
      
      setTransactions(transactionsData.data || []);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      completed: { variant: "default" as const, label: "Selesai", icon: CheckCircle },
      pending: { variant: "secondary" as const, label: "Menunggu", icon: Clock },
      failed: { variant: "destructive" as const, label: "Gagal", icon: AlertCircle }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap];
    if (!statusInfo) return null;
    
    const Icon = statusInfo.icon;
    
    return (
      <Badge variant={statusInfo.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{statusInfo.label}</span>
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
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
        <Button variant="outline" className="mt-4" onClick={fetchData}>
          Retry
        </Button>
      </div>
    );
  }

  const completedCount = transactions.filter(t => t.status === 'completed').length;
  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Sistem Pembayaran</h2>
          <p className="text-gray-600">Kelola metode pembayaran dan transaksi</p>
        </div>
      </div>

      <Tabs defaultValue="methods" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/50">
          <TabsTrigger value="methods">Metode Pembayaran</TabsTrigger>
          <TabsTrigger value="transactions">Transaksi</TabsTrigger>
          <TabsTrigger value="reports">Laporan</TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="space-y-6">
          {/* Payment Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Hari Ini</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.today.revenue ?? 0)}</div>
                <p className="text-xs text-green-100">
                  {stats?.today.revenue_change && stats.today.revenue_change > 0 ? '+' : ''}
                  {stats?.today.revenue_change ?? 0}% dari kemarin
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Transaksi Selesai</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedCount}</div>
                <p className="text-xs text-blue-100">dari {transactions.length} transaksi</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Menunggu Bayar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <p className="text-xs text-orange-100">perlu follow up</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Order Hari Ini</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.today.orders ?? 0}</div>
                <p className="text-xs text-purple-100">orders baru</p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Metode Pembayaran Tersedia</CardTitle>
              <CardDescription>Pilih metode pembayaran yang ingin diaktifkan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={method.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        method.available
                          ? selectedPayment === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-100 bg-gray-50 opacity-60'
                      }`}
                      onClick={() => method.available && setSelectedPayment(method.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            method.available ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              method.available ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-medium">{method.name}</h4>
                            <p className="text-sm text-gray-600">{method.description}</p>
                            {method.fee !== 0 && (
                              <p className="text-xs text-orange-600">
                                Biaya admin: {typeof method.fee === 'number' ? `Rp ${method.fee.toLocaleString()}` : method.fee}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant={method.available ? "default" : "secondary"}>
                          {method.available ? "Aktif" : "Segera"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {selectedPayment && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Konfigurasi Pembayaran</h4>
                  <div className="space-y-2">
                    {selectedPayment === "transfer" && (
                      <div>
                        <p className="text-sm text-blue-800">Rekening Bank:</p>
                        <p className="text-sm text-blue-700">BCA: 1234567890 a.n CleanStride</p>
                        <p className="text-sm text-blue-700">Mandiri: 0987654321 a.n CleanStride</p>
                      </div>
                    )}
                    {selectedPayment === "ewallet" && (
                      <div>
                        <p className="text-sm text-blue-800">E-Wallet yang didukung:</p>
                        <p className="text-sm text-blue-700">GoPay, OVO, DANA, LinkAja</p>
                        <p className="text-sm text-blue-700">Biaya admin Rp 2,500 per transaksi</p>
                      </div>
                    )}
                    {selectedPayment === "cod" && (
                      <div>
                        <p className="text-sm text-blue-800">Cash on Delivery:</p>
                        <p className="text-sm text-blue-700">Customer bayar tunai saat sepatu diantar</p>
                        <p className="text-sm text-blue-700">Tidak ada biaya tambahan</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Transaksi Terbaru</CardTitle>
              <CardDescription>Daftar transaksi pembayaran</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Belum ada transaksi</p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.transaction_number}</p>
                          <p className="text-sm text-gray-600">
                            {transaction.order?.customer_name || 'Customer'} • {transaction.order?.order_number}
                          </p>
                          <p className="text-xs text-gray-500">{transaction.created_at}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-green-600">{transaction.amount_formatted}</p>
                        <p className="text-sm text-gray-600">{transaction.method_label}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Metode Pembayaran Populer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Transfer Bank</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">COD</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '25%'}}></div>
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">E-Wallet</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '15%'}}></div>
                      </div>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Ringkasan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.today.revenue ?? 0)}</p>
                    <p className="text-sm text-green-700">Pendapatan Hari Ini</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{stats?.today.orders ?? 0}</p>
                    <p className="text-sm text-blue-700">Total Order</p>
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-lg font-bold text-orange-600">{stats?.processing_orders ?? 0}</p>
                  <p className="text-sm text-orange-700">Orders Dalam Proses</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentSystem;
