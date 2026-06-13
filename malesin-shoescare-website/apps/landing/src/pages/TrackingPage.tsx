import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, CheckCircle, Clock, Package, AlertCircle, MessageCircle } from 'lucide-react';
import { api, TrackingData } from '@/lib/api';

const statusDescriptions: Record<string, { emoji: string; title: string; desc: string }> = {
  PENDING: { emoji: '📋', title: 'Menunggu Konfirmasi', desc: 'Order kamu sudah masuk dan menunggu konfirmasi dari tim kami.' },
  PICKUP: { emoji: '🚗', title: 'Proses Penjemputan', desc: 'Tim kami sedang dalam perjalanan untuk menjemput sepatu kamu.' },
  PROCESSING: { emoji: '🧼', title: 'Sedang Dicuci', desc: 'Sepatu kamu sedang menjalani proses pencucian profesional.' },
  QC: { emoji: '🔍', title: 'Quality Control', desc: 'Tim QC sedang memeriksa hasil pencucian untuk memastikan kualitas terbaik.' },
  READY: { emoji: '✅', title: 'Siap Diantar', desc: 'Sepatu kamu sudah bersih dan siap untuk diantar kembali!' },
  DELIVERY: { emoji: '📦', title: 'Sedang Diantar', desc: 'Sepatu kamu sedang dalam perjalanan ke alamat kamu.' },
  COMPLETED: { emoji: '🎉', title: 'Selesai!', desc: 'Order telah selesai. Terima kasih sudah menggunakan layanan kami!' },
  CANCELLED: { emoji: '❌', title: 'Dibatalkan', desc: 'Order ini telah dibatalkan.' },
};

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

function getDaysRemaining(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return 'Sudah lewat estimasi';
  if (days === 0) return 'Hari ini';
  if (days === 1) return 'Besok';
  return `${days} hari lagi`;
}

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
  useEffect(() => {
    if (codeFromUrl) {
      setLoading(true);
      setSearched(true);
      api.trackOrder(codeFromUrl)
        .then(setTracking)
        .catch(() => setTracking(null))
        .finally(() => setLoading(false));
    }
  }, [codeFromUrl]);

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

  const statusInfo = tracking ? statusDescriptions[tracking.status] : null;
  const daysRemaining = tracking ? getDaysRemaining(tracking.estimatedCompletion) : null;

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
              {/* Status Explanation Card */}
              {statusInfo && (
                <div className={`border-brutal shadow-brutal p-6 ${
                  tracking.status === 'COMPLETED' ? 'bg-emerald-50' :
                  tracking.status === 'CANCELLED' ? 'bg-red-50' :
                  'bg-purple-50'
                }`}>
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{statusInfo.emoji}</span>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{statusInfo.title}</h3>
                      <p className="text-gray-600">{statusInfo.desc}</p>
                      {tracking.timeline && (() => {
                        const lastCompleted = [...tracking.timeline]
                          .reverse()
                          .find(s => s.completedAt);
                        if (lastCompleted?.completedAt) {
                          return (
                            <p className="text-sm text-gray-400 mt-2">
                              Update terakhir: {getTimeAgo(lastCompleted.completedAt)}
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              )}

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
                    {daysRemaining && tracking.status !== 'COMPLETED' && tracking.status !== 'CANCELLED' && (
                      <p className="text-xs text-purple-600 font-medium mt-0.5">
                        {daysRemaining}
                      </p>
                    )}
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
                  <div className="w-full bg-gray-200 h-4 border-2 border-black overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-1000 ease-out relative"
                      style={{ width: `${tracking.progress}%` }}
                    >
                      {tracking.progress > 0 && tracking.progress < 100 && (
                        <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Bubbles */}
              <div className="border-brutal shadow-brutal-lg p-8 bg-white">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  TIMELINE ORDER
                </h3>
                <div className="relative">
                  {tracking.timeline.map((step, index) => {
                    const isLast = index === tracking.timeline.length - 1;
                    const isActive = step.completed && (!tracking.timeline[index + 1]?.completed);
                    
                    return (
                      <div key={step.id} className="flex items-start gap-4 relative">
                        {/* Connector line */}
                        <div className="flex flex-col items-center">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2
                            transition-all duration-300
                            ${step.completed 
                              ? 'bg-green-500 border-green-600 text-white' 
                              : isActive 
                                ? 'bg-purple-100 border-purple-500 text-purple-600'
                                : 'bg-gray-100 border-gray-300 text-gray-400'
                            }
                            ${isActive ? 'ring-4 ring-purple-200 animate-pulse' : ''}
                          `}>
                            {step.completed ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <span className="text-sm font-bold">{index + 1}</span>
                            )}
                          </div>
                          {!isLast && (
                            <div className={`w-0.5 h-12 mt-1 transition-colors duration-300 ${
                              step.completed ? 'bg-green-300' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>

                        {/* Content */}
                        <div className={`flex-1 pb-6 ${isLast ? '' : ''}`}>
                          <p className={`font-bold text-base ${
                            step.completed ? 'text-gray-900' : 
                            isActive ? 'text-purple-700' : 'text-gray-400'
                          }`}>
                            {step.step}
                          </p>
                          <p className={`text-sm ${step.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                            {step.description}
                          </p>
                          {step.completedAt && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <Clock className="w-3.5 h-3.5 text-green-500" />
                              <p className="text-xs text-green-600">
                                {new Date(step.completedAt).toLocaleString('id-ID')} • {getTimeAgo(step.completedAt)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* WhatsApp CTA */}
              {tracking.status !== 'COMPLETED' && tracking.status !== 'CANCELLED' && (
                <a
                  href={`https://wa.me/+6287890224566?text=${encodeURIComponent(
                    `Halo, saya ingin bertanya tentang order ${tracking.orderNumber}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-500 text-white px-8 py-4 font-bold text-lg border-brutal shadow-brutal text-center hover-lift active-press"
                >
                  <span className="inline-flex items-center justify-center gap-3">
                    <MessageCircle className="w-6 h-6" />
                    Ada pertanyaan? Hubungi via WhatsApp
                  </span>
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
