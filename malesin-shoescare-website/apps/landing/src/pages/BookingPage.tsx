import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { api, Service, BookingData } from '@/lib/api';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const serviceIdFromUrl = searchParams.get('service');

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  
  const [formData, setFormData] = useState<BookingData>({
    customer_name: '',
    phone: '',
    address: '',
    email: '',
    service_id: serviceIdFromUrl ? parseInt(serviceIdFromUrl) : 0,
    shoe_type: '',
    quantity: 1,
    notes: '',
    pickup_date: '',
    pickup_time: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const data = await api.getServices();
      setServices(data);
      // If serviceId from URL, set it
      if (serviceIdFromUrl) {
        setFormData(prev => ({ ...prev, service_id: parseInt(serviceIdFromUrl) }));
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    
    try {
      const result = await api.submitBooking(formData);
      if (result.success) {
        setOrderNumber(result.order_number || null);
        setSubmitted(true);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim booking. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-20 bg-lime-400">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white border-brutal shadow-brutal-lg p-12">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-3xl font-bold mb-4">BOOKING BERHASIL!</h2>
            {orderNumber && (
              <p className="text-lg mb-2 font-mono bg-gray-100 px-4 py-2 inline-block border-2 border-black">
                Order ID: {orderNumber}
              </p>
            )}
            <p className="text-lg mb-8 mt-4">
              Tim kami akan menghubungi kamu dalam 1x24 jam untuk konfirmasi jadwal pickup.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/"
                className="bg-black text-white px-8 py-4 font-bold inline-block border-brutal"
              >
                KEMBALI KE HOME
              </a>
              <a
                href="https://wa.me/+628123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-8 py-4 font-bold inline-flex items-center gap-2 border-brutal"
              >
                <MessageCircle className="w-5 h-5" />
                HUBUNGI VIA WHATSAPP
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-blue-500 text-white border-b-3 border-black py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">BOOKING</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Isi form di bawah dan tim kami akan pickup sepatu kamu sesuai jadwal.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 border-brutal mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold mb-2">NAMA LENGKAP *</label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-4 py-3 border-brutal focus:outline-none focus:shadow-brutal transition-shadow"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block font-bold mb-2">NO. WHATSAPP *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-brutal focus:outline-none focus:shadow-brutal transition-shadow"
                  placeholder="08123456789"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-2">EMAIL (Opsional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-brutal focus:outline-none focus:shadow-brutal transition-shadow"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">ALAMAT PICKUP *</label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border-brutal focus:outline-none focus:shadow-brutal transition-shadow"
                rows={3}
                placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Malang"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">LAYANAN *</label>
              {loadingServices ? (
                <div className="w-full px-4 py-3 border-brutal bg-gray-100 animate-pulse">
                  Memuat layanan...
                </div>
              ) : (
                <select
                  required
                  value={formData.service_id}
                  onChange={(e) => setFormData({ ...formData, service_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-brutal focus:outline-none focus:shadow-brutal transition-shadow bg-white"
                >
                  <option value="">-- Pilih Layanan --</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.price_formatted}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold mb-2">JENIS SEPATU *</label>
                <input
                  type="text"
                  required
                  value={formData.shoe_type}
                  onChange={(e) => setFormData({ ...formData, shoe_type: e.target.value })}
                  className="w-full px-4 py-3 border-brutal focus:outline-none focus:shadow-brutal transition-shadow"
                  placeholder="Nike Air Max, Adidas, dll"
                />
              </div>
              <div>
                <label className="block font-bold mb-2">JUMLAH PASANG *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="10"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-brutal focus:outline-none focus:shadow-brutal transition-shadow"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold mb-2">TANGGAL PICKUP *</label>
                <input
                  type="date"
                  required
                  value={formData.pickup_date}
                  onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                  className="w-full px-4 py-3 border-brutal focus:outline-none focus:shadow-brutal transition-shadow"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block font-bold mb-2">WAKTU PICKUP *</label>
                <select
                  required
                  value={formData.pickup_time}
                  onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
                  className="w-full px-4 py-3 border-brutal focus:outline-none focus:shadow-brutal transition-shadow bg-white"
                >
                  <option value="">-- Pilih Waktu --</option>
                  <option value="09:00">09:00 - 11:00</option>
                  <option value="11:00">11:00 - 13:00</option>
                  <option value="13:00">13:00 - 15:00</option>
                  <option value="15:00">15:00 - 17:00</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold mb-2">CATATAN (Opsional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border-brutal focus:outline-none focus:shadow-brutal transition-shadow"
                rows={3}
                placeholder="Kondisi sepatu, noda khusus, dll."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-500 text-black px-8 py-5 font-bold text-xl border-brutal shadow-brutal-lg hover-lift active-press disabled:opacity-50"
            >
              {submitting ? 'MEMPROSES...' : 'SUBMIT BOOKING →'}
            </button>

            <p className="text-center text-gray-500 text-sm">
              Atau booking langsung via{' '}
              <a href="https://wa.me/+628123456789" target="_blank" rel="noopener noreferrer" className="text-green-600 font-bold hover:underline">
                WhatsApp
              </a>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
