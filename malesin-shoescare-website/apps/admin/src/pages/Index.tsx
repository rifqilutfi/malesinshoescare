
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShirtIcon, Users, TruckIcon, ClipboardCheck, CreditCard, BarChart3, Bell, Shield } from "lucide-react";
import Dashboard from "@/components/Dashboard";
import OrderForm from "@/components/OrderForm";
import ServiceManagement from "@/components/ServiceManagement";
import OrderTracking from "@/components/OrderTracking";
import PaymentSystem from "@/components/PaymentSystem";
import ReportSystem from "@/components/ReportSystem";

const Index = () => {
  const [currentTab, setCurrentTab] = useState("overview");

  const features = [
    {
      icon: Users,
      title: "Manajemen Pengguna",
      description: "Kelola akun admin, kurir, workshop, dan pelanggan dengan mudah"
    },
    {
      icon: ShirtIcon,
      title: "Order Online",
      description: "Sistem pemesanan lengkap dengan detail layanan dan upload foto sepatu"
    },
    {
      icon: TruckIcon,
      title: "Kurir Real-time",
      description: "Penjemputan dan pengantaran dengan tracking real-time"
    },
    {
      icon: ClipboardCheck,
      title: "Workshop Management",
      description: "Pelacakan proses pencucian hingga quality control"
    },
    {
      icon: CreditCard,
      title: "Payment Gateway",
      description: "COD, transfer bank, dan integrasi payment gateway modern"
    },
    {
      icon: BarChart3,
      title: "Laporan & Analytics",
      description: "Laporan operasional dan keuangan yang jelas dan mudah dipahami"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <ShirtIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">malesin_shoescare</h1>
                <p className="text-xs text-gray-500">Laundry System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifikasi
              </Button>
              <Button size="sm">Login</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="order">Order</TabsTrigger>
            <TabsTrigger value="services">Layanan</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="reports">Laporan</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                malesin_shoescare Laundry System
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Platform manajemen bisnis laundry sepatu yang modern, lengkap dengan fitur order online, 
                tracking real-time, dan sistem pembayaran terintegrasi.
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => setCurrentTab("order")} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Buat Order Baru
                </Button>
                <Button onClick={() => setCurrentTab("dashboard")} variant="outline" size="lg">
                  Lihat Dashboard
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {features.map((feature, index) => (
                <Card key={index} className="bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <feature.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold">1,234</CardTitle>
                  <CardDescription className="text-blue-100">Total Orders</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold">98%</CardTitle>
                  <CardDescription className="text-green-100">Customer Satisfaction</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold">24h</CardTitle>
                  <CardDescription className="text-purple-100">Average Processing</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold">567</CardTitle>
                  <CardDescription className="text-orange-100">Active Customers</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="order">
            <OrderForm />
          </TabsContent>

          <TabsContent value="services">
            <ServiceManagement />
          </TabsContent>

          <TabsContent value="tracking">
            <OrderTracking />
          </TabsContent>

          <TabsContent value="payment">
            <PaymentSystem />
          </TabsContent>

          <TabsContent value="reports">
            <ReportSystem />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <ShirtIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">malesin_shoescare</h3>
                  <p className="text-sm text-gray-400">Laundry System</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                Platform manajemen laundry sepatu terpercaya dengan teknologi modern.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Fitur Utama</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Order Online</li>
                <li>• Real-time Tracking</li>
                <li>• Payment Gateway</li>
                <li>• Workshop Management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Keamanan</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Shield className="h-4 w-4" />
                <span>SSL Encrypted & Secure</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 mt-8 text-center">
            <p className="text-gray-400 text-sm">© 2024 malesin_shoescare Laundry System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
