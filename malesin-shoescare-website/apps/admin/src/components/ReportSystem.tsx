
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  DollarSign, 
  ShirtIcon, 
  Users, 
  Clock,
  FileText,
  PieChart,
  Loader2,
  AlertCircle
} from "lucide-react";
import { reportsService } from "@/services/reports";
import { servicesService } from "@/services/services";
import { transactionsService } from "@/services/transactions";
import { ordersService } from "@/services/orders";
import { exportFinancialPDF, exportTransactionsExcel, exportOrdersCSV } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";
import type { DashboardStats, Service, Transaction, Order } from "@/types";

const ReportSystem = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("30days");

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, servicesData, transactionsData, ordersData] = await Promise.all([
        reportsService.getDashboardStats(),
        servicesService.getAll(),
        transactionsService.getAll({ per_page: 100 }),
        ordersService.getAll({ per_page: 100 }),
      ]);
      
      setStats(statsData);
      setServices(servicesData);
      setTransactions(transactionsData.data || []);
      setOrders(ordersData.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const customerMetrics = [
    { metric: "Customer Aktif", value: stats?.active_customers?.toString() ?? "0", change: "+12%" },
    { metric: "Order Hari Ini", value: stats?.today.orders?.toString() ?? "0", change: `+${stats?.today.orders_change ?? 0}%` },
    { metric: "Orders Proses", value: stats?.processing_orders?.toString() ?? "0", change: "" },
    { metric: "Pendapatan Hari Ini", value: formatCurrency(stats?.today.revenue ?? 0), change: `+${stats?.today.revenue_change ?? 0}%` }
  ];

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Laporan & Analytics</h2>
          <p className="text-gray-600">Dashboard analisis bisnis dan laporan keuangan</p>
        </div>
        <div className="flex space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Hari Terakhir</SelectItem>
              <SelectItem value="30days">30 Hari Terakhir</SelectItem>
              <SelectItem value="3months">3 Bulan Terakhir</SelectItem>
              <SelectItem value="6months">6 Bulan Terakhir</SelectItem>
              <SelectItem value="1year">1 Tahun Terakhir</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Keuangan</TabsTrigger>
          <TabsTrigger value="operational">Operasional</TabsTrigger>
          <TabsTrigger value="customer">Customer</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue Hari Ini</CardTitle>
                <DollarSign className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.today.revenue ?? 0)}</div>
                <p className="text-xs text-blue-100">
                  {stats?.today.revenue_change && stats.today.revenue_change > 0 ? '+' : ''}
                  {stats?.today.revenue_change ?? 0}% dari kemarin
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders Hari Ini</CardTitle>
                <ShirtIcon className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.today.orders ?? 0}</div>
                <p className="text-xs text-green-100">
                  {stats?.today.orders_change && stats.today.orders_change > 0 ? '+' : ''}
                  {stats?.today.orders_change ?? 0}% dari kemarin
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Aktif</CardTitle>
                <Users className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.active_customers ?? 0}</div>
                <p className="text-xs text-purple-100">30 hari terakhir</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders Dalam Proses</CardTitle>
                <Clock className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.processing_orders ?? 0}</div>
                <p className="text-xs text-orange-100">Sedang dikerjakan</p>
              </CardContent>
            </Card>
          </div>

          {/* Services Performance */}
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Layanan Tersedia
              </CardTitle>
              <CardDescription>Daftar layanan dan harga</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <ShirtIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.duration}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{service.price_formatted}</p>
                      <span className={`text-xs px-2 py-1 rounded ${service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {service.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Summary */}
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Ringkasan Keuangan
                </CardTitle>
                <CardDescription>Analisis keuangan hari ini</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">Revenue Hari Ini</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(stats?.today.revenue ?? 0)}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">Orders Hari Ini</p>
                    <p className="text-xl font-bold text-blue-600">{stats?.today.orders ?? 0}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-700">Orders Proses</p>
                    <p className="text-xl font-bold text-orange-600">{stats?.processing_orders ?? 0}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-700">Customer Aktif</p>
                    <p className="text-xl font-bold text-purple-600">{stats?.active_customers ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Services */}
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Layanan Terpopuler
                </CardTitle>
                <CardDescription>Berdasarkan harga</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.slice(0, 4).map((service) => {
                    const maxPrice = Math.max(...services.map(s => s.price));
                    return (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-600">{service.duration}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{service.price_formatted}</p>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{width: `${(service.price / maxPrice) * 100}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Status Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Orders Proses</span>
                    <span className="text-sm font-medium">{stats?.processing_orders ?? 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Orders Hari Ini</span>
                    <span className="text-sm font-medium">{stats?.today.orders ?? 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '80%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Produktivitas Harian</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm">Orders Hari Ini</span>
                  <span className="font-bold text-blue-600">{stats?.today.orders ?? 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm">Revenue Hari Ini</span>
                  <span className="font-bold text-green-600">{formatCurrency(stats?.today.revenue ?? 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm">Dalam Proses</span>
                  <span className="font-bold text-orange-600">{stats?.processing_orders ?? 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Layanan Aktif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {services.filter(s => s.is_active).length}
                  </div>
                  <div className="text-sm text-green-700">Layanan Aktif</div>
                  <div className="text-xs text-green-600">dari {services.length} total</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customer" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Metrics */}
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Metrik Bisnis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customerMetrics.map((metric, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{metric.metric}</span>
                    <div className="text-right">
                      <span className="font-bold">{metric.value}</span>
                      {metric.change && (
                        <span className={`text-xs ml-2 ${
                          metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.change}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Ringkasan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {stats?.active_customers ?? 0}
                  </div>
                  <div className="text-sm text-blue-700">Customer Aktif</div>
                  <div className="text-xs text-blue-600">30 hari terakhir</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">{stats?.today.orders ?? 0}</p>
                    <p className="text-xs text-green-700">Orders Hari Ini</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-lg font-bold text-orange-600">{stats?.processing_orders ?? 0}</p>
                    <p className="text-xs text-orange-700">Dalam Proses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Export Laporan
          </CardTitle>
          <CardDescription>Download laporan dalam berbagai format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              disabled={exporting === 'pdf'}
              onClick={async () => {
                try {
                  setExporting('pdf');
                  await exportFinancialPDF(stats, transactions);
                  toast({ title: "Export Berhasil", description: "Laporan keuangan PDF berhasil didownload" });
                } catch (err) {
                  toast({ title: "Error", description: "Gagal export PDF", variant: "destructive" });
                } finally {
                  setExporting(null);
                }
              }}
            >
              {exporting === 'pdf' ? (
                <Loader2 className="h-6 w-6 mb-2 animate-spin" />
              ) : (
                <Download className="h-6 w-6 mb-2" />
              )}
              <span>Laporan Keuangan PDF</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              disabled={exporting === 'excel'}
              onClick={async () => {
                try {
                  setExporting('excel');
                  await exportTransactionsExcel(transactions);
                  toast({ title: "Export Berhasil", description: "Data transaksi Excel berhasil didownload" });
                } catch (err) {
                  toast({ title: "Error", description: "Gagal export Excel", variant: "destructive" });
                } finally {
                  setExporting(null);
                }
              }}
            >
              {exporting === 'excel' ? (
                <Loader2 className="h-6 w-6 mb-2 animate-spin" />
              ) : (
                <Download className="h-6 w-6 mb-2" />
              )}
              <span>Data Transaksi Excel</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              disabled={exporting === 'csv'}
              onClick={async () => {
                try {
                  setExporting('csv');
                  await exportOrdersCSV(orders);
                  toast({ title: "Export Berhasil", description: "Data orders CSV berhasil didownload" });
                } catch (err) {
                  toast({ title: "Error", description: "Gagal export CSV", variant: "destructive" });
                } finally {
                  setExporting(null);
                }
              }}
            >
              {exporting === 'csv' ? (
                <Loader2 className="h-6 w-6 mb-2 animate-spin" />
              ) : (
                <Download className="h-6 w-6 mb-2" />
              )}
              <span>Data Orders CSV</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportSystem;
