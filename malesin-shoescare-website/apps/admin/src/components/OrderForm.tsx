
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, ShirtIcon, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { servicesService } from "@/services/services";
import { ordersService } from "@/services/orders";
import type { Service, OrderFormData } from "@/types";

const OrderForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    address: "",
    email: "",
    serviceId: "",
    shoeType: "",
    quantity: 1,
    notes: "",
    pickupDate: "",
    pickupTime: "",
    urgent: false
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newPhotos = Array.from(files).slice(0, 4 - photos.length); // Max 4 photos
    setPhotos(prev => [...prev, ...newPhotos]);
    
    // Create previews
    newPhotos.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const shoeTypes = [
    "Sneakers", "Formal Shoes", "Boots", "Sandals", "Sports Shoes", "High Heels", "Lainnya"
  ];

  // Fetch services from API
  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const data = await servicesService.getAll(true);
        setServices(data);
      } catch (err) {
        console.error('Failed to fetch services:', err);
        setError('Gagal memuat layanan');
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serviceId) {
      toast({ title: "Error", description: "Pilih layanan terlebih dahulu", variant: "destructive" });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const orderData: OrderFormData = {
        customer_name: formData.customerName,
        phone: formData.phone,
        address: formData.address,
        email: formData.email || undefined,
        service_id: parseInt(formData.serviceId),
        shoe_type: formData.shoeType,
        quantity: formData.quantity,
        notes: formData.notes || undefined,
        pickup_date: formData.pickupDate,
        pickup_time: formData.pickupTime,
        is_urgent: formData.urgent,
      };
      
      const response = await ordersService.create(orderData);
      
      // Upload photos if any
      if (photos.length > 0) {
        const orderId = response.data.id;
        
        // Upload each photo
        await Promise.all(
          photos.map(photo => ordersService.uploadPhoto(orderId, photo, 'before'))
        );
      }
      
      toast({
        title: "Order Berhasil Dibuat!",
        description: `Order ID: ${response.data.order_number} telah dibuat.${photos.length > 0 ? ` ${photos.length} foto berhasil diupload.` : ''}`,
      });
      
      // Navigate to orders list
      navigate('/dashboard/orders');
      
    } catch (err) {
      console.error('Failed to create order:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Gagal membuat order",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = services.find(s => s.id.toString() === formData.serviceId);
  const totalPrice = selectedService ? selectedService.price * formData.quantity : 0;
  const urgentFee = formData.urgent ? totalPrice * 0.3 : 0;
  const finalPrice = totalPrice + urgentFee;

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
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Buat Order Baru</h2>
        <p className="text-gray-600">Isi form di bawah untuk membuat pesanan laundry sepatu</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Form */}
        <div className="lg:col-span-2">
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShirtIcon className="h-5 w-5 mr-2" />
                Detail Pesanan
              </CardTitle>
              <CardDescription>Masukkan informasi customer dan detail sepatu</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informasi Customer</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">Nama Lengkap</Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="Masukkan nama customer"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="08123456789"
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email (Opsional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="customer@email.com"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Alamat Lengkap</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Masukkan alamat lengkap untuk pickup dan delivery"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Service Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pilih Layanan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="service">Jenis Layanan</Label>
                      <Select 
                        value={formData.serviceId} 
                        onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                        disabled={submitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih layanan" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id.toString()}>
                              <div className="flex justify-between items-center w-full">
                                <span>{service.name}</span>
                                <span className="text-sm text-gray-500 ml-4">{service.price_formatted}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="shoeType">Jenis Sepatu</Label>
                      <Select 
                        value={formData.shoeType} 
                        onValueChange={(value) => setFormData({ ...formData, shoeType: value })}
                        disabled={submitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis sepatu" />
                        </SelectTrigger>
                        <SelectContent>
                          {shoeTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Jumlah Sepatu</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Pickup Schedule */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Jadwal Pickup</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickupDate">Tanggal Pickup</Label>
                      <Input
                        id="pickupDate"
                        type="date"
                        value={formData.pickupDate}
                        onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pickupTime">Waktu Pickup</Label>
                      <Select 
                        value={formData.pickupTime} 
                        onValueChange={(value) => setFormData({ ...formData, pickupTime: value })}
                        disabled={submitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih waktu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09:00">09:00 - 11:00</SelectItem>
                          <SelectItem value="11:00">11:00 - 13:00</SelectItem>
                          <SelectItem value="13:00">13:00 - 15:00</SelectItem>
                          <SelectItem value="15:00">15:00 - 17:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Opsi Tambahan</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="urgent"
                      checked={formData.urgent}
                      onCheckedChange={(checked) => setFormData({ ...formData, urgent: checked as boolean })}
                      disabled={submitting}
                    />
                    <Label htmlFor="urgent" className="text-sm">
                      Express Service (+30% biaya)
                    </Label>
                  </div>
                  <div>
                    <Label htmlFor="notes">Catatan Khusus</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Catatan khusus untuk sepatu (noda, kerusakan, dll)"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Upload Foto Sepatu (Opsional)</h3>
                  
                  {/* Photo Previews */}
                  {photoPreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {photoPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img src={preview} alt={`Photo ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {photos.length < 4 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Upload foto sepatu untuk dokumentasi (max 4)</p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                          disabled={submitting}
                        />
                        <Button type="button" variant="outline" size="sm" disabled={submitting} asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Pilih Foto ({photos.length}/4)
                          </span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Membuat Pesanan...
                    </>
                  ) : (
                    'Buat Pesanan'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="bg-white/70 backdrop-blur-sm sticky top-6">
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedService && (
                <>
                  <div className="flex justify-between">
                    <span>Layanan:</span>
                    <span className="font-medium">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimasi:</span>
                    <Badge variant="outline">{selectedService.duration}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Harga per sepatu:</span>
                    <span>{selectedService.price_formatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jumlah:</span>
                    <span>{formData.quantity} sepatu</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rp {totalPrice.toLocaleString()}</span>
                  </div>
                  {formData.urgent && (
                    <div className="flex justify-between text-orange-600">
                      <span>Express fee (+30%):</span>
                      <span>Rp {urgentFee.toLocaleString()}</span>
                    </div>
                  )}
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>Rp {finalPrice.toLocaleString()}</span>
                  </div>
                </>
              )}
              
              {!selectedService && (
                <p className="text-gray-500 text-center">Pilih layanan untuk melihat estimasi harga</p>
              )}

              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-medium">Alur Order:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Pending</strong> → Assign kurir untuk pickup</li>
                  <li>• <strong>Pickup</strong> → Kurir menjemput sepatu</li>
                  <li>• <strong>Processing</strong> → Workshop proses cuci</li>
                  <li>• <strong>QC</strong> → Quality control</li>
                  <li>• <strong>Ready</strong> → Siap delivery</li>
                  <li>• <strong>Completed</strong> → Selesai</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
