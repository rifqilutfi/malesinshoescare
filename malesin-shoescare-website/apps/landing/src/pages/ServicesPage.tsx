import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, Service } from '@/lib/api';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await api.getServices();
      setServices(data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-lime-400 border-b-3 border-black py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">LAYANAN KAMI</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Pilih layanan sesuai kebutuhan sepatu kamu. Semua harga termasuk pickup & delivery gratis untuk area Malang.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border-brutal shadow-brutal-lg bg-white p-8 animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service) => (
                <div 
                  key={service.id} 
                  className="border-brutal shadow-brutal-lg bg-white p-8 hover-lift"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold">{service.name}</h3>
                    <span className="bg-orange-500 text-black px-4 py-2 font-bold border-2 border-black">
                      {service.price_formatted}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="bg-black text-white px-3 py-1 text-sm font-bold">
                      {service.duration}
                    </span>
                    <Link
                      to={`/booking?service=${service.id}`}
                      className="bg-lime-400 text-black px-6 py-2 font-bold border-2 border-black hover:bg-lime-300 transition-colors"
                    >
                      PILIH →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-100 border-t-3 border-black">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'Berapa lama proses cuci sepatu?', a: 'Tergantung layanan yang dipilih, mulai dari 1 hari untuk Quick Wash hingga 3-5 hari untuk Premium Care.' },
              { q: 'Apakah ada garansi?', a: 'Ya! Kami memberikan garansi kepuasan. Jika tidak puas, kami cuci ulang gratis.' },
              { q: 'Bagaimana cara booking?', a: 'Cukup booking via website atau WhatsApp, kurir kami akan pickup ke lokasi kamu.' },
              { q: 'Area mana saja yang dijangkau?', a: 'Kami melayani pickup & delivery gratis untuk area Malang dan sekitarnya.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white border-brutal p-6">
                <h4 className="font-bold text-lg mb-2">{faq.q}</h4>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
