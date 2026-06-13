import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Loader2, ArrowRight, Upload, Camera, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api, AIRecommendation, AIImageAnalysis } from '@/lib/api';

const materials = [
  'Canvas', 'Leather', 'Suede', 'Mesh', 'Knit', 'Rubber', 'Synthetic', 'Nubuck',
];

const conditions = [
  'Light Dust', 'Minor Stains', 'Moderate Dirt', 'Heavy Dirt', 
  'Deep Stains', 'Yellowed Sole', 'Scuff Marks', 'Mud Covered',
];

const analysisMessages = [
  'Menganalisis gambar sepatu...',
  'Mendeteksi kondisi material...',
  'Memeriksa tingkat kotoran...',
  'Mengidentifikasi area kerusakan...',
  'Menyusun rekomendasi...',
];

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 75 ? 'from-green-400 to-green-600' : value >= 50 ? 'from-yellow-400 to-yellow-600' : 'from-red-400 to-red-600';
  const label = value >= 75 ? 'Tinggi' : value >= 50 ? 'Sedang' : 'Rendah';
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-500">Confidence</span>
        <span className="font-bold">{value}% — {label}</span>
      </div>
      <div className="w-full bg-gray-200 h-3 border-2 border-black">
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function AIRecommendPage() {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('image');

  // Text-based state
  const [material, setMaterial] = useState('');
  const [condition, setCondition] = useState('');
  const [customMaterial, setCustomMaterial] = useState('');
  const [customCondition, setCustomCondition] = useState('');
  const [textLoading, setTextLoading] = useState(false);
  const [textResult, setTextResult] = useState<AIRecommendation | null>(null);
  const [textError, setTextError] = useState<string | null>(null);

  // Image-based state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState<AIImageAnalysis | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const effectiveMaterial = material === 'other' ? customMaterial : material;
  const effectiveCondition = condition === 'other' ? customCondition : condition;

  // ── Text submit ──
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveMaterial || !effectiveCondition) return;

    setTextLoading(true);
    setTextError(null);
    setTextResult(null);

    try {
      const data = await api.getRecommendation(effectiveMaterial, effectiveCondition);
      if (data) {
        setTextResult(data);
      } else {
        setTextError('Gagal mendapatkan rekomendasi. Silakan coba lagi.');
      }
    } catch {
      setTextError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setTextLoading(false);
    }
  };

  // ── Image handling ──
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageError('File harus berupa gambar (JPG, PNG, atau WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Ukuran file maksimal 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageError(null);
    setImageResult(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageResult(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageSubmit = async () => {
    if (!imageFile) return;

    setImageLoading(true);
    setImageError(null);
    setImageResult(null);
    setLoadingMessage(0);

    // Rotate loading messages
    const interval = setInterval(() => {
      setLoadingMessage((prev) => (prev + 1) % analysisMessages.length);
    }, 2000);

    try {
      const data = await api.analyzeShoeImage(imageFile);
      if (data) {
        setImageResult(data);
      } else {
        setImageError('Gagal menganalisis gambar. Silakan coba lagi.');
      }
    } catch {
      setImageError('Terjadi kesalahan saat menganalisis gambar.');
    } finally {
      setImageLoading(false);
      clearInterval(interval);
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
            Upload foto sepatu untuk analisis AI atau pilih material & kondisi secara manual.
          </p>
        </div>
      </section>

      {/* Tabs + Content */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          {/* Tab Switcher */}
          <div className="flex mb-10 border-brutal overflow-hidden">
            <button
              onClick={() => setActiveTab('image')}
              className={`flex-1 py-4 font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'image'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white'
                  : 'bg-white hover:bg-indigo-50'
              }`}
            >
              <Camera className="w-5 h-5" />
              UPLOAD FOTO
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-4 font-bold text-lg flex items-center justify-center gap-2 transition-all border-l-2 border-black ${
                activeTab === 'text'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white'
                  : 'bg-white hover:bg-indigo-50'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              PILIH MANUAL
            </button>
          </div>

          {/* ═══ IMAGE TAB ═══ */}
          {activeTab === 'image' && (
            <div className="space-y-8">
              {/* Upload Area */}
              {!imagePreview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-brutal border-dashed cursor-pointer p-12 text-center transition-all ${
                    isDragging
                      ? 'bg-indigo-50 shadow-brutal border-indigo-400'
                      : 'bg-gray-50 hover:bg-indigo-50 hover:shadow-brutal'
                  }`}
                >
                  <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-indigo-600 animate-bounce' : 'text-gray-400'}`} />
                  <p className="font-bold text-lg mb-2">
                    {isDragging ? 'Lepaskan file di sini!' : 'Upload Foto Sepatu'}
                  </p>
                  <p className="text-gray-500 mb-4">
                    Drag & drop atau klik untuk memilih foto
                  </p>
                  <p className="text-sm text-gray-400">
                    Format: JPG, PNG, WebP • Maks. 5MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border-brutal overflow-hidden">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview sepatu"
                      className="w-full h-64 object-cover"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute top-3 right-3 bg-black text-white p-2 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4 bg-gray-50 flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate flex-1 mr-4">
                      {imageFile?.name}
                    </p>
                    <button
                      onClick={handleImageSubmit}
                      disabled={imageLoading}
                      className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-3 font-bold border-brutal shadow-brutal hover-lift active-press disabled:opacity-50 flex items-center gap-2"
                    >
                      {imageLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          MENGANALISIS...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          ANALISIS
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Animated Loading */}
              {imageLoading && (
                <div className="border-brutal p-8 bg-gradient-to-br from-indigo-50 to-purple-50 text-center">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
                  </div>
                  <p className="font-bold text-lg text-indigo-700 animate-pulse">
                    {analysisMessages[loadingMessage]}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    AI sedang memeriksa foto sepatu kamu
                  </p>
                </div>
              )}

              {/* Image Error */}
              {imageError && (
                <div className="bg-red-50 text-red-600 px-4 py-3 border-brutal flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  {imageError}
                </div>
              )}

              {/* Image Result */}
              {imageResult && (
                <div className="border-brutal shadow-brutal-lg p-8 bg-gradient-to-br from-indigo-50 to-purple-50 space-y-6 animate-in fade-in duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">HASIL ANALISIS AI</h3>
                      <p className="text-sm text-gray-500">Berdasarkan foto yang diupload</p>
                    </div>
                  </div>

                  {/* Condition Badge */}
                  <div className="bg-white border-brutal p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-500">Kondisi Terdeteksi</p>
                      <p className="text-xl font-bold text-indigo-700">{imageResult.condition}</p>
                    </div>
                  </div>

                  {/* Recommended Service */}
                  <div className="bg-white border-brutal p-6">
                    <p className="text-sm text-gray-500 mb-1">Layanan yang Direkomendasikan</p>
                    <p className="text-3xl font-bold text-indigo-700">{imageResult.recommendedService}</p>
                  </div>

                  {/* Explanation */}
                  <div className="bg-white border-brutal p-6">
                    <p className="text-sm text-gray-500 mb-1">Penjelasan AI</p>
                    <p className="text-gray-700 leading-relaxed">{imageResult.explanation}</p>
                  </div>

                  {/* Confidence */}
                  <div className="bg-white border-brutal p-6">
                    <ConfidenceBar value={imageResult.confidence} />
                  </div>

                  <Link
                    to="/booking"
                    className="w-full bg-indigo-600 text-white px-8 py-4 font-bold text-lg border-brutal shadow-brutal inline-flex items-center justify-center gap-2 hover-lift active-press"
                  >
                    BOOKING LAYANAN INI
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ═══ TEXT TAB ═══ */}
          {activeTab === 'text' && (
            <div>
              <form onSubmit={handleTextSubmit} className="space-y-8 mb-12">
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
                  disabled={textLoading || !effectiveMaterial || !effectiveCondition}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-8 py-5 font-bold text-xl border-brutal shadow-brutal-lg hover-lift active-press disabled:opacity-50"
                >
                  {textLoading ? (
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

              {/* Text Error */}
              {textError && (
                <div className="bg-red-50 text-red-600 px-4 py-3 border-brutal mb-8 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  {textError}
                </div>
              )}

              {/* Text Result */}
              {textResult && (
                <div className="border-brutal shadow-brutal-lg p-8 bg-gradient-to-br from-indigo-50 to-purple-50 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-8 h-8 text-indigo-600" />
                    <h3 className="text-2xl font-bold">REKOMENDASI AI</h3>
                  </div>

                  <div className="bg-white border-brutal p-6">
                    <p className="text-sm text-gray-500 mb-1">Layanan yang Direkomendasikan</p>
                    <p className="text-3xl font-bold text-indigo-700">{textResult.recommendedService}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border-brutal p-4">
                      <p className="text-sm text-gray-500 mb-1">Estimasi Durasi</p>
                      <p className="text-xl font-bold">{textResult.estimatedDuration}</p>
                    </div>
                    <div className="bg-white border-brutal p-4">
                      <p className="text-sm text-gray-500 mb-1">Estimasi Harga</p>
                      <p className="text-xl font-bold text-green-600">
                        Rp {textResult.estimatedPrice.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-brutal p-6">
                    <p className="text-sm text-gray-500 mb-1">Alasan</p>
                    <p className="text-gray-700">{textResult.reason}</p>
                  </div>

                  <Link
                    to="/booking"
                    className="w-full bg-indigo-600 text-white px-8 py-4 font-bold text-lg border-brutal shadow-brutal inline-flex items-center justify-center gap-2 hover-lift active-press"
                  >
                    BOOKING LAYANAN INI
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
