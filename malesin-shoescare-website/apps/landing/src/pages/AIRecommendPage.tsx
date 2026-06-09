import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { api, AIRecommendation } from '@/lib/api';

const materials = [
  'Canvas', 'Leather', 'Suede', 'Mesh', 'Knit', 'Rubber', 'Synthetic', 'Nubuck',
];

const conditions = [
  'Light Dust', 'Minor Stains', 'Moderate Dirt', 'Heavy Dirt', 
  'Deep Stains', 'Yellowed Sole', 'Scuff Marks', 'Mud Covered',
];

export default function AIRecommendPage() {
  const [material, setMaterial] = useState('');
  const [condition, setCondition] = useState('');
  const [customMaterial, setCustomMaterial] = useState('');
  const [customCondition, setCustomCondition] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const effectiveMaterial = material === 'other' ? customMaterial : material;
  const effectiveCondition = condition === 'other' ? customCondition : condition;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveMaterial || !effectiveCondition) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.getRecommendation(effectiveMaterial, effectiveCondition);
      if (data) {
        setResult(data);
      } else {
        setError('Gagal mendapatkan rekomendasi. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-b-3 border-black py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold text-sm">AI-POWERED</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">REKOMENDASI LAYANAN</h1>
          <p className="text-xl max-w-2xl mx-auto text-indigo-100">
            Bingung pilih layanan? AI kami akan merekomendasikan layanan terbaik berdasarkan material dan kondisi sepatu kamu.
          </p>
        </div>
      </section>

      {/* Form + Result */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <form onSubmit={handleSubmit} className="space-y-8 mb-12">
            {/* Material */}
            <div>
              <label className="block font-bold text-lg mb-3">MATERIAL SEPATU *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {materials.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMaterial(m)}
                    className={`px-4 py-3 border-brutal font-bold text-sm transition-all ${
                      material === m
                        ? 'bg-indigo-600 text-white shadow-brutal'
                        : 'bg-white hover:bg-indigo-50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setMaterial('other')}
                  className={`px-4 py-3 border-brutal font-bold text-sm transition-all ${
                    material === 'other'
                      ? 'bg-indigo-600 text-white shadow-brutal'
                      : 'bg-white hover:bg-indigo-50'
                  }`}
                >
                  Lainnya...
                </button>
              </div>
              {material === 'other' && (
                <input
                  type="text"
                  value={customMaterial}
                  onChange={(e) => setCustomMaterial(e.target.value)}
                  placeholder="Ketik material sepatu..."
                  className="w-full mt-3 px-4 py-3 border-brutal focus:outline-none focus:shadow-brutal"
                  required
                />
              )}
            </div>

            {/* Condition */}
            <div>
              <label className="block font-bold text-lg mb-3">KONDISI SEPATU *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {conditions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCondition(c)}
                    className={`px-4 py-3 border-brutal font-bold text-sm transition-all ${
                      condition === c
                        ? 'bg-purple-600 text-white shadow-brutal'
                        : 'bg-white hover:bg-purple-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCondition('other')}
                  className={`px-4 py-3 border-brutal font-bold text-sm transition-all ${
                    condition === 'other'
                      ? 'bg-purple-600 text-white shadow-brutal'
                      : 'bg-white hover:bg-purple-50'
                  }`}
                >
                  Lainnya...
                </button>
              </div>
              {condition === 'other' && (
                <input
                  type="text"
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                  placeholder="Deskripsikan kondisi sepatu..."
                  className="w-full mt-3 px-4 py-3 border-brutal focus:outline-none focus:shadow-brutal"
                  required
                />
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !effectiveMaterial || !effectiveCondition}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-8 py-5 font-bold text-xl border-brutal shadow-brutal-lg hover-lift active-press disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  MENGANALISIS...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  DAPATKAN REKOMENDASI
                </span>
              )}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 border-brutal mb-8">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="border-brutal shadow-brutal-lg p-8 bg-gradient-to-br from-indigo-50 to-purple-50 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-indigo-600" />
                <h3 className="text-2xl font-bold">REKOMENDASI AI</h3>
              </div>

              <div className="bg-white border-brutal p-6">
                <p className="text-sm text-gray-500 mb-1">Layanan yang Direkomendasikan</p>
                <p className="text-3xl font-bold text-indigo-700">{result.recommendedService}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border-brutal p-4">
                  <p className="text-sm text-gray-500 mb-1">Estimasi Durasi</p>
                  <p className="text-xl font-bold">{result.estimatedDuration}</p>
                </div>
                <div className="bg-white border-brutal p-4">
                  <p className="text-sm text-gray-500 mb-1">Estimasi Harga</p>
                  <p className="text-xl font-bold text-green-600">
                    Rp {result.estimatedPrice.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="bg-white border-brutal p-6">
                <p className="text-sm text-gray-500 mb-1">Alasan</p>
                <p className="text-gray-700">{result.reason}</p>
              </div>

              <Link
                to={`/booking`}
                className="w-full bg-indigo-600 text-white px-8 py-4 font-bold text-lg border-brutal shadow-brutal inline-flex items-center justify-center gap-2 hover-lift active-press"
              >
                BOOKING LAYANAN INI
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
