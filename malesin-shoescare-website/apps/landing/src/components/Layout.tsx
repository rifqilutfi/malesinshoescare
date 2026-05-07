import { Outlet, Link } from 'react-router-dom';
import { Instagram, MessageCircle, MapPin, Clock, Menu } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-3 border-black sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-orange-500 text-black font-bold text-xl px-3 py-1 border-brutal shadow-brutal">
              malesin
            </div>
            <span className="font-bold text-lg">shoescare</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/services" className="font-semibold hover:text-orange-500 transition-colors">
              LAYANAN
            </Link>
            <Link to="/booking" className="font-semibold hover:text-orange-500 transition-colors">
              BOOKING
            </Link>
            <Link to="/contact" className="font-semibold hover:text-orange-500 transition-colors">
              KONTAK
            </Link>
            <a 
              href="https://wa.me/+628123456789" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-4 py-2 font-bold hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              WHATSAPP
            </a>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 border-brutal">
            <Menu className="w-6 h-6" />
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-orange-500 text-black font-bold text-lg px-3 py-1">
                  malesin
                </div>
                <span className="font-bold">shoescare</span>
              </div>
              <p className="text-gray-400">
                Layanan cuci sepatu premium dengan kualitas terbaik.
              </p>
            </div>

            {/* Layanan */}
            <div>
              <h4 className="font-bold mb-4 text-orange-500">LAYANAN</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Deep Clean</li>
                <li>Quick Wash</li>
                <li>Premium Care</li>
                <li>Unyellowing</li>
              </ul>
            </div>

            {/* Jam Operasional & Lokasi */}
            <div>
              <h4 className="font-bold mb-4 text-orange-500">JAM OPERASIONAL</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start space-x-2">
                  <Clock className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>Open: 08.30 - 17.00</p>
                    <p className="text-red-400">Tutup: Sabtu - Minggu</p>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>Tirto Utomo, Landungsari</p>
                    <p>Malang</p>
                    <p className="text-lime-400 text-sm mt-1">✨ Free pickup! (minimal jarak 3km)</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Hubungi Kami */}
            <div>
              <h4 className="font-bold mb-4 text-orange-500">HUBUNGI KAMI</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a 
                    href="https://wa.me/+628123456789" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 hover:text-green-400 transition-colors group"
                  >
                    <div className="bg-green-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <span>0821 4336 6966</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.instagram.com/malesin_shoecare/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 hover:text-pink-400 transition-colors group"
                  >
                    <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <span>@malesin_shoecare</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500">© 2025 malesin_shoescare. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a 
                href="https://www.instagram.com/malesin_shoecare/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white px-4 py-2 font-bold hover:opacity-80 transition-opacity flex items-center gap-2"
              >
                <Instagram className="w-5 h-5" />
                INSTAGRAM
              </a>
              <a 
                href="https://wa.me/+628123456789" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-4 py-2 font-bold hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                WHATSAPP
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
