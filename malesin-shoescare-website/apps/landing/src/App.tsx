import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import BookingPage from './pages/BookingPage';
import TrackingPage from './pages/TrackingPage';
import AIRecommendPage from './pages/AIRecommendPage';
import ContactPage from './pages/ContactPage';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="tracking" element={<TrackingPage />} />
        <Route path="recommend" element={<AIRecommendPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>
    </Routes>
  );
}

export default App;
