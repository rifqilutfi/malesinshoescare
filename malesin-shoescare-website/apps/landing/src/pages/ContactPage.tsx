import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // TODO: Submit to API when contact endpoint exists
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Contact submitted:', formData);
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-orange-500 border-b-3 border-black py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">KONTAK KAMI</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Punya pertanyaan? Hubungi kami via form atau WhatsApp.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold mb-8">INFO KONTAK</h2>
              <div className="space-y-6">
                <div className="bg-lime-400 border-brutal shadow-brutal p-6">
                  <h3 className="font-bold text-lg mb-2">📱 WHATSAPP</h3>
                  <p>082143366966</p>
                  <a 
                    href="082143366966" 
                    target="_blank"
                    className="inline-block mt-4 bg-black text-white px-4 py-2 font-bold"
                  >
                    CHAT SEKARANG →
                  </a>
                </div>
                <div className="bg-blue-500 text-white border-brutal shadow-brutal p-6">
                  <h3 className="font-bold text-lg mb-2">📧 EMAIL</h3>
                  <p>info@malesin.shoescare.com</p>
                </div>
                <div className="bg-white border-brutal shadow-brutal p-6">
                  <h3 className="font-bold text-lg mb-2">📍 LOKASI</h3>
                  <p>Malang, Indonesia</p>
                  <p className="text-sm text-gray-600 mt-2">
                    (Workshop only - tidak menerima walk-in)
                  </p>
                </div>
                <div className="bg-white border-brutal shadow-brutal p-6">
                  <h3 className="font-bold text-lg mb-2">⏰ JAM OPERASIONAL</h3>
                  <p>Senin - Jumat: 08:30 - 17:00</p>
                  <p>Sabtu & Minggu: Libur</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-8">KIRIM PESAN</h2>
              {submitted ? (
                <div className="bg-lime-400 border-brutal shadow-brutal p-8 text-center">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="font-bold text-xl mb-2">PESAN TERKIRIM!</h3>
                  <p>Kami akan membalas dalam 1x24 jam.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block font-bold mb-2">NAMA *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-brutal focus:outline-none focus:shadow-brutal transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">EMAIL *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border-brutal focus:outline-none focus:shadow-brutal transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">PESAN *</label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border-brutal focus:outline-none focus:shadow-brutal transition-shadow"
                      rows={5}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-black text-white px-8 py-4 font-bold text-lg border-brutal shadow-brutal hover-lift active-press disabled:opacity-50"
                  >
                    {submitting ? 'MENGIRIM...' : 'KIRIM PESAN →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
