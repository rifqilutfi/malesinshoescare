import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, CheckCircle, Clock, Package, AlertCircle } from 'lucide-react';
import { api, TrackingData } from '@/lib/api';

export default function TrackingPage() {
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code') || '';

  const [orderCode, setOrderCode] = useState(codeFromUrl);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim()) return;
    
    setLoading(true);
    setSearched(true);
    try {
      const result = await api.trackOrder(orderCode.trim());
      setTracking(result);
    } catch (err) {
      console.error('Tracking error:', err);
      setTracking(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if code from URL
  useState(() => {
    if (codeFromUrl) {
      setLoading(true);
      setSearched(true);
      api.trackOrder(codeFromUrl).then(setTracking).catch(() => setTracking(null)).finally(() => setLoading(false));
    }
  });

  const getStatusLabel = (status: string): { label: string; color: string } => {
    const map: Record<string, { label: string; color: string }> = {
      'PENDING': { label: 'Menunggu', color: 'bg-yellow-500' },
      'PICKUP': { label: 'Dijemput', color: 'bg-blue-500' },
      'PROCESSING': { label: 'Diproses', color: 'bg-purple-500' },
      'QC': { label: 'Quality Control', color: 'bg-orange-500' },
      'READY': { label: 'Siap Antar', color: 'bg-green-500' },
      'DELIVERY': { label: 'Diantar', color: 'bg-teal-500' },
      'COMPLETED': { label: 'Selesai', color: 'bg-emerald-600' },
      'CANCELLED': { label: 'Dibatalkan', color: 'bg-red-500' },
    };
    return map[status] || { label: status, color: 'bg-gray-500' };
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-purple-600 text-white border-b-3 border-black py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">LACAK ORDER</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Masukkan kode order untuk melihat status pesanan kamu.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <form onSubmit={handleSearch} className="flex gap-4 mb-12">
            <input
              type="text"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              placeholder="Masukkan kode order (contoh: CLS-XXXXXXXXX)"
              className="flex-1 px-4 py-4 border-brutal focus:outline-none focus:shadow-brutal transition-shadow font-mono text-lg"
            />
            <button
              type="submit"
              disabled={loading || !orderCode.trim()}
              className="bg-purple-600 text-white px-8 py-4 font-bold border-brutal shadow-brutal hover-lift active-press disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin inline-block">⏳</span>
              ) : (
                <Search className="w-6 h-6" />
              )}
            </button>
          </form>

          {/* Results */}
          {loading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-bounce">🔍</div>
              <p className="text-gray-600 text-lg">Mencari order...</p>
            </div>
          )}

          {searched && !loading && !tracking && (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h3 className="text-2xl font-bold mb-2">ORDER TIDAK DITEMUKAN</h3>
              <p className="text-gray-600">
                Pastikan kode order benar. Kode order dikirim saat booking berhasil.
              </p>
            </div>
          )}

          {tracking && (
            <div className="space-y-8">
              {/* Order Info Card */}
              <div className="border-brutal shadow-brutal-lg p-8 bg-white">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Order Number</p>
                    <p className="text-2xl font-mono font-bold">{tracking.orderNumber}</p>
                  </div>
                  <span className={`${getStatusLabel(tracking.status).color} text-white px-4 py-2 font-bold text-sm`}>
                    {getStatusLabel(tracking.status).label}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Layanan</p>
                    <p className="font-bold">{tracking.service.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Jenis Sepatu</p>
                    <p className="font-bold">{tracking.shoeType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-bold text-green-600">Rp {Number(tracking.total).toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estimasi Selesai</p>
                    <p className="font-bold">
                      {tracking.estimatedCompletion 
                        ? new Date(tracking.estimatedCompletion).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                        : '-'
                      }
                    </p>
                  </div>
                </div>

                {tracking.isUrgent && (
                  <div className="bg-orange-100 text-orange-800 px-4 py-2 font-bold text-sm border-2 border-orange-300 inline-block">
                    ⚡ ORDER URGENT
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-bold">{tracking.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-4 border-2 border-black">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-500"
                      style={{ width: `${tracking.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="border-brutal shadow-brutal-lg p-8 bg-white">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  TIMELINE ORDER
                </h3>
                <div className="space-y-4">
                  {tracking.timeline.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-4">
                      {/* Connector line */}
                      <div className="flex flex-col items-center">
                        {step.completed ? (
                          <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                        ) : (
                          <Clock className="w-8 h-8 text-gray-300 flex-shrink-0" />
                        )}
                        {index < tracking.timeline.length - 1 && (
                          <div className={`w-0.5 h-8 mt-1 ${step.completed ? 'bg-green-300' : 'bg-gray-200'}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className={`font-bold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.step}
                        </p>
                        <p className="text-sm text-gray-500">{step.description}</p>
                        {step.completedAt && (
                          <p className="text-xs text-green-600 mt-1">
                            ✅ {new Date(step.completedAt).toLocaleString('id-ID')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
