'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ZoomIn } from 'lucide-react';

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const categories = ['all', 'haircuts', 'color', 'styling', 'nails', 'makeup'];
  
  const images = [
    { src: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?ixlib=rb-4.0.3', category: 'haircuts', title: 'Modern Bob Cut' },
    { src: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-4.0.3', category: 'color', title: 'Balayage Highlights' },
    { src: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?ixlib=rb-4.0.3', category: 'styling', title: 'Elegant Updo' },
    { src: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3', category: 'nails', title: 'Luxury Manicure' },
    { src: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3', category: 'haircuts', title: 'Pixie Cut' },
    { src: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3', category: 'color', title: 'Vibrant Color' },
    { src: 'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?ixlib=rb-4.0.3', category: 'styling', title: 'Beach Waves' },
    { src: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?ixlib=rb-4.0.3', category: 'makeup', title: 'Bridal Makeup' },
    { src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3', category: 'nails', title: 'Nail Art Design' },
  ];

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-32 bg-dark-400">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3"
            alt="Gallery Background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6">
              <span className="gold-text-gradient">Our Work Gallery</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Browse through our portfolio of stunning transformations and beautiful results.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-dark-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-medium capitalize transition-all duration-300 ${
                  selectedCategory === category
                    ? 'gold-gradient text-dark-900'
                    : 'bg-dark-400 text-gray-300 hover:text-gold-500 border border-gold-600/30'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Image Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl cursor-pointer"
                onClick={() => setSelectedImage(image.src)}
              >
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white font-display text-xl font-bold mb-2">
                      {image.title}
                    </h3>
                    <span className="text-gold-400 text-sm capitalize">
                      {image.category}
                    </span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
                    <ZoomIn className="w-5 h-5 text-dark-900" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/95 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-gold-500 transition-colors text-4xl"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <img 
            src={selectedImage} 
            alt="Gallery Preview" 
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </main>
  );
}