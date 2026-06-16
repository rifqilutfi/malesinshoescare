import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ShirtIcon, Clock, DollarSign, Loader2, AlertCircle, RefreshCw, Plus, Pencil, Trash2, Image, Tag } from "lucide-react";
import { servicesService } from "@/services/services";
import { useToast } from "@/hooks/use-toast";
import type { Service, Category } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || '';

/** Format price to Rp XX.XXX */
function formatPrice(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return `Rp ${num.toLocaleString('id-ID')}`;
}

interface ServiceFormState {
  name: string;
  description: string;
  price: string;
  duration: string;
  categoryId: string;
  isActive: boolean;
  image: File | null;
}

const emptyForm: ServiceFormState = {
  name: '',
  description: '',
  price: '',
  duration: '',
  categoryId: 'none',
  isActive: true,
  image: null,
};

const ServiceManagement = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CRUD dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceFormState>(emptyForm);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [servicesData, categoriesData] = await Promise.all([
        servicesService.getAllAdmin(),
        servicesService.getCategories(),
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to fetch:', err);
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  // ── Open dialog for create ──
  const openCreateDialog = () => {
    setEditingService(null);
    setForm(emptyForm);
    setImagePreview(null);
    setDialogOpen(true);
  };

  // ── Open dialog for edit ──
  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description,
      price: String(parseFloat(service.price)),
      duration: service.duration,
      categoryId: service.categoryId ? String(service.categoryId) : 'none',
      isActive: service.isActive,
      image: null,
    });
    setImagePreview(service.imageUrl ? `${API_URL}${service.imageUrl}` : null);
    setDialogOpen(true);
  };

  // ── Handle form submit ──
  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.price || !form.duration) {
      toast({ title: "Error", description: "Semua field wajib diisi", variant: "destructive" });
      return;
    }

    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      toast({ title: "Error", description: "Harga harus berupa angka positif", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      const data = {
        name: form.name,
        description: form.description,
        price,
        duration: form.duration,
        categoryId: form.categoryId && form.categoryId !== 'none' ? parseInt(form.categoryId) : null,
        isActive: form.isActive,
        image: form.image,
      };

      if (editingService) {
        await servicesService.update(editingService.id, data);
        toast({ title: "Berhasil", description: "Layanan berhasil diperbarui" });
      } else {
        await servicesService.create(data);
        toast({ title: "Berhasil", description: "Layanan baru berhasil dibuat" });
      }

      setDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Gagal menyimpan layanan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Handle toggle ──
  const handleToggle = async (service: Service) => {
    try {
      await servicesService.toggleActive(service.id);
      toast({
        title: "Status Diubah",
        description: `${service.name} ${service.isActive ? 'dinonaktifkan' : 'diaktifkan'}`,
      });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Gagal mengubah status", variant: "destructive" });
    }
  };

  // ── Handle delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await servicesService.delete(deleteTarget.id);
      toast({ title: "Berhasil", description: "Layanan berhasil dihapus" });
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Gagal menghapus layanan", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  // ── Image handling ──
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ── Filter ──
  const filteredServices = categoryFilter === "all"
    ? services
    : services.filter(s => String(s.categoryId) === categoryFilter);

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

  const activeCount = services.filter(s => s.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Kelola Layanan</h2>
          <p className="text-gray-600">Kelola semua layanan yang tersedia</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Layanan
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <CardTitle className="text-lg">Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>Filter Kategori:</Label>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ShirtIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Tidak ada layanan ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className={`bg-white/70 backdrop-blur-sm ${service.isActive ? '' : 'opacity-60'}`}>
              {/* Service Image */}
              {service.imageUrl && (
                <div className="h-40 overflow-hidden rounded-t-lg">
                  <img
                    src={`${API_URL}${service.imageUrl}`}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {!service.imageUrl && (
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <ShirtIcon className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={service.isActive ? "default" : "secondary"}>
                          {service.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                        {service.category && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {service.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={service.isActive}
                    onCheckedChange={() => handleToggle(service)}
                  />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="line-clamp-2">{service.description}</CardDescription>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Harga</span>
                    </div>
                    <span className="font-bold text-green-600">{formatPrice(service.price)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Estimasi</span>
                    </div>
                    <span className="text-sm font-medium">{service.duration}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(service)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteTarget(service)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ═══ Create/Edit Dialog ═══ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}</DialogTitle>
            <DialogDescription>
              {editingService ? 'Ubah detail layanan' : 'Isi detail layanan baru'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nama Layanan *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Deep Clean"
              />
            </div>

            <div>
              <Label>Deskripsi *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Deskripsi layanan..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Harga (Rp) *</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="75000"
                  min="0"
                />
              </div>
              <div>
                <Label>Durasi *</Label>
                <Input
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="3-5 Days"
                />
              </div>
            </div>

            <div>
              <Label>Kategori</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm({ ...form, categoryId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tanpa Kategori</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Gambar Layanan</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg border"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImagePreview(null);
                        setForm({ ...form, image: null });
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      Hapus
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Image className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Klik untuk upload gambar</p>
                    <p className="text-xs text-gray-400">JPG, PNG, WebP (maks. 5MB)</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Status Aktif</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingService ? 'Simpan Perubahan' : 'Tambah Layanan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Delete Confirmation ═══ */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Layanan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah kamu yakin ingin menghapus layanan <strong>{deleteTarget?.name}</strong>?
              Layanan yang memiliki order terkait tidak dapat dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceManagement;
