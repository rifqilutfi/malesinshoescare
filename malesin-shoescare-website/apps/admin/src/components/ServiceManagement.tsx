
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, ShirtIcon, Clock, DollarSign, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { servicesService } from "@/services/services";
import type { Service } from "@/types";

const ServiceManagement = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: ""
  });

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await servicesService.getAll();
      setServices(data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setError('Gagal memuat layanan');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: ""
    });
    setEditingService(null);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      
      const serviceData = {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price),
        duration: formData.duration,
        is_active: true,
      };
      
      if (editingService) {
        await servicesService.update(editingService.id, serviceData);
        toast({
          title: "Layanan Diperbarui",
          description: `${formData.name} berhasil diperbarui.`,
        });
      } else {
        await servicesService.create(serviceData);
        toast({
          title: "Layanan Ditambahkan",
          description: `${formData.name} berhasil ditambahkan.`,
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchServices();
    } catch (err) {
      console.error('Failed to save service:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Gagal menyimpan layanan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus layanan ini?')) return;
    
    try {
      await servicesService.delete(id);
      toast({
        title: "Layanan Dihapus",
        description: "Layanan berhasil dihapus dari sistem.",
        variant: "destructive"
      });
      fetchServices();
    } catch (err) {
      console.error('Failed to delete service:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Gagal menghapus layanan",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      await servicesService.toggle(service.id);
      toast({
        title: service.is_active ? "Layanan Dinonaktifkan" : "Layanan Diaktifkan",
        description: `${service.name} berhasil diubah statusnya.`,
      });
      fetchServices();
    } catch (err) {
      console.error('Failed to toggle service:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Gagal mengubah status",
        variant: "destructive",
      });
    }
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
        <Button variant="outline" className="mt-4" onClick={fetchServices}>
          Retry
        </Button>
      </div>
    );
  }

  const activeCount = services.filter(s => s.is_active).length;
  const minPrice = services.length > 0 ? Math.min(...services.map(s => s.price)) : 0;
  const maxPrice = services.length > 0 ? Math.max(...services.map(s => s.price)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Manajemen Layanan</h2>
          <p className="text-gray-600">Kelola layanan dan harga laundry sepatu</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Layanan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Edit Layanan" : "Tambah Layanan Baru"}
              </DialogTitle>
              <DialogDescription>
                {editingService 
                  ? "Perbarui informasi layanan yang sudah ada"
                  : "Buat layanan baru untuk ditawarkan kepada customer"
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Layanan</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Premium Clean"
                  disabled={saving}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan detail layanan ini..."
                  disabled={saving}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Harga (Rp)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="45000"
                    disabled={saving}
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">Estimasi Waktu</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="1-2 hari"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  `${editingService ? "Perbarui" : "Tambah"} Layanan`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Service Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Layanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Layanan Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Harga Terendah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {minPrice.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Harga Tertinggi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {maxPrice.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ShirtIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Belum ada layanan. Klik "Tambah Layanan" untuk memulai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className={`bg-white/70 backdrop-blur-sm ${service.is_active ? '' : 'opacity-60'}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <ShirtIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={service.is_active ? "default" : "secondary"}>
                          {service.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription>{service.description}</CardDescription>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Harga</span>
                    </div>
                    <span className="font-bold text-green-600">
                      {service.price_formatted}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Estimasi</span>
                    </div>
                    <span className="text-sm font-medium">{service.duration}</span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => toggleActive(service)}
                >
                  {service.is_active ? "Nonaktifkan" : "Aktifkan"} Layanan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
