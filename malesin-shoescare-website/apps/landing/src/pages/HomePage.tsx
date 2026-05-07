import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MessageCircle, Instagram } from 'lucide-react';
import { api, Service } from '@/lib/api';

// Mock reviews data
const reviews = [
  { id: 1, name: 'Andi Pratama', rating: 5, text: 'Sepatu Nike saya udah kuning banget, setelah di-treatment jadi kayak baru lagi! Mantap banget hasilnya.', avatar: '👨' },
  { id: 2, name: 'Sarah Wijaya', rating: 5, text: 'Fast response, pickup tepat waktu, dan hasil cuciannya bersih banget. Recommended!', avatar: '👩' },
  { id: 3, name: 'Rizky Ramadhan', rating: 5, text: 'Udah langganan dari 6 bulan lalu. Kualitas selalu konsisten dan harga worth it.', avatar: '👨‍💼' },
  { id: 4, name: 'Dian Astuti', rating: 4, text: 'Sepatu boots saya yang udah kotor banget sekarang jadi kinclong. Terima kasih malesin!', avatar: '👩‍💼' },
  { id: 5, name: 'Budi Santoso', rating: 5, text: 'Premium care-nya worth every penny. Sepatu kesayangan jadi awet dan terawat.', avatar: '🧑' },
  { id: 6, name: 'Maya Putri', rating: 5, text: 'Suka banget sama layanannya! Pickup & delivery gratis, hasil memuaskan.', avatar: '👧' },
];

// Gallery data - using local images from assets
const galleryImages = [
  { id: 1, src: '/images/gallery images/gallery1.jpg', title: 'Deep Clean Treatment', desc: 'Dari kuning kusam jadi putih kinclong' },
  { id: 2, src: '/images/gallery images/gallery2.webp', title: 'Premium Care', desc: 'Full treatment + protection coating' },
  { id: 3, src: '/images/gallery images/gallery3.jpg', title: 'Restoration', desc: 'Restorasi total sneakers vintage' },
  { id: 4, src: '/images/gallery images/gallery4.webp', title: 'Quick Wash', desc: 'Bersih dalam 1 hari' },
  { id: 5, src: '/images/gallery images/gallery5.jpg', title: 'Unyellowing', desc: 'Sole putih kembali seperti baru' },
  { id: 6, src: '/images/gallery images/gallery6.jpg', title: 'Deep Clean', desc: 'Siap untuk lari lagi!' },
];

// Icon mapping for services
const serviceIcons: Record<string, string> = {
  'Deep Clean': '🧹',
  'Quick Wash': '⚡',
  'Premium Care': '💎',
  'Unyellowing': '✨',
};

export default function HomePage() {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const itemsPerView = 3;
  const maxIndex = Math.max(0, galleryImages.length - itemsPerView);

  useEffect(() => {
    api.getServices().then(setServices).catch(console.error);
  }, []);

  const nextGallery = () => setGalleryIndex((prev) => Math.min(prev + 1, maxIndex));
  const prevGallery = () => setGalleryIndex((prev) => Math.max(prev - 1, 0));

  return (
    <div>
      {/* Hero Section with gradient background */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 border-b-3 border-black py-20 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-black text-white px-4 py-2 font-bold mb-6 transform -rotate-2">
                #YOUR BEST SHOE PARTNER IN MALANG
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                SEPATU <br />
                <span className="bg-white px-2 inline-block transform rotate-1">BERSIH</span>
                <br />
                TANPA RIBET
              </h1>
              <p className="text-xl mb-8 max-w-lg">
                Layanan cuci sepatu premium dengan kualitas terbaik. 
                Pickup & delivery gratis untuk area Malang.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/booking"
                  className="bg-black text-white px-8 py-4 font-bold text-lg border-brutal shadow-brutal-lg hover-lift active-press inline-block"
                >
                  BOOKING SEKARANG →
                </Link>
                <a
                  href="https://wa.me/+628123456789"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-8 py-4 font-bold text-lg border-brutal shadow-brutal hover-lift active-press inline-flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  CHAT WHATSAPP
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white border-brutal shadow-brutal-lg p-8 transform rotate-2">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg overflow-hidden">
                  <img 
                    src="/images/main.jpeg" 
                    alt="Sneaker"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-lime-400 text-black px-4 py-2 font-bold border-brutal transform -rotate-3">
                ✨ HASIL KINCLONG!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b-3 border-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '5000+', label: 'SEPATU DICUCI' },
              { number: '4.9', label: 'RATING' },
              { number: '99%', label: 'SATISFIED' },
              { number: '24H', label: 'EXPRESS' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold">{stat.number}</div>
                <div className="text-sm font-semibold text-gray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview with pattern background */}
      <section className="py-20 bg-lime-400 border-b-3 border-black relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold mb-4 text-center">
            LAYANAN KAMI
          </h2>
          <p className="text-center text-lg mb-12 max-w-2xl mx-auto">
            Pilih layanan sesuai kebutuhan sepatu kamu
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {(services.length > 0 ? services.slice(0, 3) : [
              { id: 1, name: 'Deep Clean', price_formatted: 'Rp 85.000', description: 'Cuci mendalam + whitening', duration: '2-3 hari' },
              { id: 2, name: 'Quick Wash', price_formatted: 'Rp 50.000', description: 'Cuci cepat untuk noda ringan', duration: '1 hari' },
              { id: 3, name: 'Premium Care', price_formatted: 'Rp 150.000', description: 'Full treatment + protection', duration: '3-5 hari' },
            ] as Service[]).map((service) => (
              <div key={service.id} className="bg-white border-brutal shadow-brutal-lg p-6 hover-lift">
                <div className="text-4xl mb-4">{serviceIcons[service.name] || '👟'}</div>
                <h3 className="text-2xl font-bold mb-2">{service.name.toUpperCase()}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">{service.price_formatted}</span>
                  <span className="bg-black text-white px-3 py-1 text-sm">{service.duration}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/services"
              className="bg-black text-white px-8 py-4 font-bold border-brutal shadow-brutal inline-block hover-lift"
            >
              LIHAT SEMUA LAYANAN →
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Section with Carousel */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4 text-center">
            GALLERY HASIL KERJA
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Lihat transformasi sepatu customer kami
          </p>
          
          {/* Carousel */}
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={prevGallery}
              disabled={galleryIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 z-10 bg-white text-black border-3 border-black p-2 md:p-3 shadow-brutal hover-lift disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            
            <button
              onClick={nextGallery}
              disabled={galleryIndex >= maxIndex}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 z-10 bg-white text-black border-3 border-black p-2 md:p-3 shadow-brutal hover-lift disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Carousel Container */}
            <div className="overflow-hidden mx-8 md:mx-12">
              <div 
                className="flex transition-transform duration-500 ease-out gap-6"
                style={{ transform: `translateX(-${galleryIndex * (100 / itemsPerView + 2)}%)` }}
              >
                {galleryImages.map((image) => (
                  <div 
                    key={image.id} 
                    className="flex-shrink-0 w-full md:w-[calc(33.333%-1rem)]"
                  >
                    <div className="bg-white border-brutal shadow-brutal-lg overflow-hidden group">
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img 
                          src={image.src} 
                          alt={image.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <span className="text-white font-bold">{image.title}</span>
                        </div>
                      </div>
                      <div className="p-4 text-black">
                        <h3 className="font-bold text-lg">{image.title}</h3>
                        <p className="text-gray-600 text-sm">{image.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIndex(i)}
                  className={`w-3 h-3 rounded-full border-2 border-white transition-colors ${
                    i === galleryIndex ? 'bg-orange-500' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <a
              href="https://www.instagram.com/malesin_shoecare/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white px-8 py-4 font-bold inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Instagram className="w-5 h-5" />
              LIHAT LEBIH BANYAK DI INSTAGRAM →
            </a>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-blue-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold mb-4 text-center">
            APA KATA MEREKA?
          </h2>
          <p className="text-center text-blue-100 mb-12 max-w-2xl mx-auto">
            Review jujur dari customer setia malesin_shoescare
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white text-black border-brutal shadow-brutal p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">{review.avatar}</div>
                  <div>
                    <p className="font-bold">{review.name}</p>
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-500">⭐</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">&ldquo;{review.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with gradient */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-yellow-400 border-t-3 border-black">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            SIAP BIKIN SEPATU KINCLONG?
          </h2>
          <p className="text-xl mb-8">
            Pickup gratis, cuci dengan expert, delivery ke depan pintu.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/booking"
              className="bg-black text-white px-12 py-5 font-bold text-xl border-brutal shadow-brutal-lg inline-block hover-lift active-press"
            >
              BOOKING SEKARANG
            </Link>
            <a
              href="https://wa.me/+628123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-12 py-5 font-bold text-xl border-brutal shadow-brutal-lg inline-flex items-center gap-2 hover-lift active-press"
            >
              <MessageCircle className="w-6 h-6" />
              CHAT WHATSAPP
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
