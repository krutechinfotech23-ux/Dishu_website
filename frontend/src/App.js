import { useState, useEffect, useRef, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Camera, Heart, Baby, Phone, Mail, MapPin, Menu, X, ChevronDown, Star, Award, Clock, Users, Calendar, Volume2, VolumeX, ChevronRight, Instagram, MessageCircle } from "lucide-react";

const BACKEND_URL = "https://dishu-website.onrender.com";
const API = `${BACKEND_URL}/api`;

// Logo URL
const LOGO_URL = "https://customer-assets.emergentagent.com/job_dishu-preview/artifacts/nxnnj8c3_image.png";

// Wedding Gallery Images (25 images)
const WEDDING_GALLERY = [
  { id: 1, url: "/wedding/wedding1.JPG" },
  { id: 2, url: "/wedding/wedding2.JPG" },
  { id: 3, url: "/wedding/wedding3.JPG" },
  { id: 4, url: "/wedding/wedding4.JPG" },
  { id: 5, url: "/wedding/wedding5.JPG" },
  { id: 6, url: "/wedding/wedding6.JPG" },
  { id: 7, url: "/wedding/wedding7.JPG" },
  { id: 8, url: "/wedding/wedding8.JPG" },
  { id: 9, url: "/wedding/wedding9.JPG" },
  { id: 10, url: "/wedding/wedding10.JPG" },
];

// Baby Gallery Images (25 images)
const BABY_GALLERY = [
  { id: 1, url: "/baby/baby-1.jpeg" },
  { id: 2, url: "/baby/baby-2.jpeg" },
  { id: 3, url: "/baby/baby-3.jpeg" },
  { id: 4, url: "/baby/baby-4.jpeg" },
  { id: 5, url: "/baby/baby-5.jpeg" },
  { id: 6, url: "/baby/baby-6.jpeg" },
  { id: 7, url: "/baby/baby-7.jpeg" },
  { id: 8, url: "/baby/baby-8.jpeg" },
  { id: 9, url: "/baby/baby-9.jpeg" },
  { id: 10, url: "/baby/baby-10.jpeg" },
];

// Hero Video
const HERO_VIDEO = "/video/video.mp4";

// Social Links
const INSTAGRAM_URL = "https://www.instagram.com/dishu_studio_wedding";
const WHATSAPP_NUMBER = "919825761628";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

// Lightbox Modal Component
const LightboxModal = ({ isOpen, onClose, item, type }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!item) return null;

  // Get 4 related images (current + 3 next/prev)
  const gallery = type === 'wedding' ? WEDDING_GALLERY : BABY_GALLERY;
  const currentIndex = gallery.findIndex(g => g.id === item.id);
  const relatedImages = [
gallery[currentIndex]
];

  return (
    <div 
      className={`lightbox-overlay ${isOpen ? 'open' : ''}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="lightbox-modal"
    >
      <button 
        className="lightbox-close" 
        onClick={onClose}
        data-testid="lightbox-close-btn"
      >
        <X size={22} color="#6B5010" />
      </button>
      
      <div className="lightbox-content">
        <div className="lightbox-grid">
          {relatedImages.map((img, index) => (
            <img 
              key={index} 
              src={img.url} 
              alt={type === 'wedding' ? img.couple : img.name}
              className="rounded-lg shadow-md"
            />
          ))}
        </div>
        
         <div className="text-center pt-4 border-t border-[#F7C52B]/20">
          {type === 'wedding' ? (
            <>
              <h3 className="font-playfair text-xl sm:text-2xl text-[#6B5010] mb-3">{item.couple}</h3>
            </>
          ) : (
            <>
              <h3 className="font-playfair text-xl sm:text-2xl text-[#6B5010] mb-3">{item.name}</h3>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


// Intro Animation Component
const IntroAnimation = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = 0.2;
      audioRef.current.play().catch(() => {});
    }

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 1000);
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete, isMuted]);

  return (
    <div className={`intro-overlay ${fadeOut ? 'fade-out' : ''}`} data-testid="intro-overlay">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />
      <img src={LOGO_URL} alt="Dishu Studio" className="intro-logo" />
      <p className="intro-text">Welcome to Dishu Studio</p>
      <button 
        onClick={() => setIsMuted(!isMuted)} 
        className="absolute bottom-8 right-8 p-3 rounded-full bg-white/50 hover:bg-white transition-all"
        data-testid="intro-mute-btn"
      >
        {isMuted ? <VolumeX size={20} color="#8B6914" /> : <Volume2 size={20} color="#8B6914" />}
      </button>
    </div>
  );
};

// Navigation Component
const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services', hasDropdown: true },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'nav-scrolled py-3' : 'bg-white/90 backdrop-blur-sm py-5'
      }`}
      data-testid="main-navigation"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" data-testid="nav-logo">
          <img src={LOGO_URL} alt="Dishu Studio" className="h-12 w-12 object-contain" />
          <span className="font-playfair text-xl text-[#8B6914] font-semibold hidden sm:block">Dishu Studio</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <div key={item.name} className="relative group">
              <Link
                to={item.path}
                className={`nav-link flex items-center gap-1 ${location.pathname === item.path ? 'text-[#F7C52B]' : ''}`}
                data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                {item.name}
                {item.hasDropdown && <ChevronDown size={16} />}
              </Link>
              {item.hasDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden">
                  <Link to="/services/wedding" className="block px-4 py-3 hover:bg-[#FFFBF5] text-[#6B5010] transition-colors" data-testid="nav-wedding-shoot">
                    Wedding Shoot
                  </Link>
                  <Link to="/services/baby" className="block px-4 py-3 hover:bg-[#FFFBF5] text-[#6B5010] transition-colors" data-testid="nav-baby-shoot">
                    Baby Shoot
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        <button 
          onClick={() => navigate('/contact')} 
          className="btn-premium hidden md:block"
          data-testid="nav-booking-btn"
        >
          Book Now
        </button>

        <button 
          className="md:hidden p-2" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          data-testid="mobile-menu-toggle"
        >
          {isMobileMenuOpen ? <X size={28} color="#8B6914" /> : <Menu size={28} color="#8B6914" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu - Full Screen Slide */}
      <div 
        className={`fixed top-0 right-0 h-screen w-full bg-white shadow-2xl md:hidden z-50 transform transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col p-8 bg-white">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <img src={LOGO_URL} alt="Dishu Studio" className="h-14 w-14" />
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-[#FFFBF5] hover:bg-[#F7C52B]/20 transition-colors"
              data-testid="mobile-menu-close"
            >
              <X size={24} color="#8B6914" />
            </button>
          </div>
          
          {/* Navigation Links */}
          <div className="flex-1 flex flex-col justify-center space-y-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block text-center text-2xl font-playfair font-medium transition-all duration-300 py-2 ${
                  location.pathname === item.path 
                    ? 'text-[#F7C52B]' 
                    : 'text-[#6B5010] hover:text-[#F7C52B]'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* Book Now Button */}
          <div className="pt-8 pb-8">
            <button 
              onClick={() => { navigate('/contact'); setIsMobileMenuOpen(false); }} 
              className="btn-premium w-full text-center py-4"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="footer py-16" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={LOGO_URL} alt="Dishu Studio" className="h-16 w-16" />
              <span className="font-playfair text-2xl text-[#8B6914] font-semibold">Dishu Studio</span>
            </div>
            <p className="text-[#6B5010]/60 max-w-md leading-relaxed mb-6">
              Capturing your most precious moments with elegance and artistry. We specialize in wedding and baby photography that tells your unique story.
            </p>
            {/* Social Buttons */}
            <div className="flex gap-4">
              <a 
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                data-testid="footer-instagram-btn"
              >
                <Instagram size={20} />
                Instagram
              </a>
              <a 
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 bg-[#25D366] text-white rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                data-testid="footer-whatsapp-btn"
              >
                <MessageCircle size={20} />
                WhatsApp
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-playfair text-lg text-[#8B6914] font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-[#6B5010]/60 hover:text-[#F7C52B] transition-colors">Home</Link>
              <Link to="/about" className="block text-[#6B5010]/60 hover:text-[#F7C52B] transition-colors">About Us</Link>
              <Link to="/services" className="block text-[#6B5010]/60 hover:text-[#F7C52B] transition-colors">Services</Link>
              <Link to="/contact" className="block text-[#6B5010]/60 hover:text-[#F7C52B] transition-colors">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="font-playfair text-lg text-[#8B6914] font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[#F7C52B] mt-1 flex-shrink-0" />
                <p className="text-[#6B5010]/60 text-sm">B-12 Gopinath Complex, Lajamani Chowk, Mota Varachha, Surat, Gujarat</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[#F7C52B]" />
                <a href="mailto:dishumukesh@gmail.com" className="text-[#6B5010]/60 hover:text-[#F7C52B] text-sm">dishumukesh@gmail.com</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-[#F7C52B]" />
                <a href="tel:+919825761628" className="text-[#6B5010]/60 hover:text-[#F7C52B] text-sm">+91 9825761628</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#8B6914]/10 mt-12 pt-8 text-center">
          <p className="text-[#6B5010]/50 text-sm">© 2026 krutechinfotech. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Gallery Showcase Section Component
const GalleryShowcase = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const navigate = useNavigate();

  const handleImageClick = (item) => {
    setSelectedItem(item);
    setIsLightboxOpen(true);
  };

  return (
    <>
      <section className="gallery-section py-24 md:py-32" data-testid="gallery-showcase">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-[#F7C52B] uppercase tracking-[0.2em] text-sm mb-3">Our Portfolio</p>
            <h2 className="font-playfair text-4xl md:text-5xl text-[#6B5010] font-medium mb-4">
              Curated Gallery
            </h2>
            <div className="divider-accent mx-auto mb-6"></div>
            <p className="text-[#6B5010]/60 max-w-2xl mx-auto">
              Explore our curated gallery showcasing authentic moments, artistic shots, and professional studio work.
            </p>
          </div>

          {/* Hanging Photo Gallery Grid - 5x5 */}
          <div className="gallery-grid mb-12" data-testid="gallery-grid">
            {WEDDING_GALLERY.map((item, index) => (
              <div 
                key={item.id}
                className="hanging-photo"
                onClick={() => handleImageClick(item)}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  opacity: 0,
                  animation: 'fadeInUp 0.6s ease forwards'
                }}
                data-testid={`gallery-item-${item.id}`}
              >
                <img src={item.url} alt={item.couple} loading="lazy" />
              </div>
            ))}
          </div>

          {/* Section Footer Text */}
          <div className="text-center">
            <h3 className="font-playfair text-2xl md:text-3xl text-[#6B5010] font-medium mb-4 max-w-3xl mx-auto leading-relaxed">
              Explore Our Curated Gallery Showcasing Authentic Moments, Artistic Shots, and Professional Studio Work
            </h3>
            <p className="text-[#6B5010]/50 mb-8">
              A showcase of our finest moments captured with clarity and expertise.
            </p>
            <button 
              onClick={() => navigate('/services')} 
              className="btn-premium inline-flex items-center gap-2"
              data-testid="view-full-gallery-btn"
            >
              View Full Gallery
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <LightboxModal 
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        item={selectedItem}
        type="wedding"
      />

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

// Home Page Component
const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: Award, title: 'Award Winning', description: 'Recognized for excellence in creative photography and storytelling.' },
    { icon: Heart, title: 'Passion Driven', description: 'We pour our heart into every shot, capturing genuine emotions.' },
    { icon: Clock, title: 'Timeless Results', description: 'Photos that you will cherish for generations to come.' },
    { icon: Users, title: 'Personal Touch', description: 'We build relationships, not just take photographs.' },
  ];

  return (
    <div data-testid="home-page">
      {/* Hero Section with Video Background */}
      <section className="hero-section" data-testid="hero-section">
        <div className="hero-bg">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        </div>
        <div className="hero-overlay" />
      </section>

      {/* Gallery Showcase Section - After Hero, Before Services */}
      <GalleryShowcase />

      {/* Featured Services Section */}
      <section className="section-white py-24 md:py-32" data-testid="featured-services">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 reveal">
            <p className="text-[#F7C52B] uppercase tracking-[0.2em] text-sm mb-3">Our Expertise</p>
            <h2 className="font-playfair text-4xl md:text-5xl text-[#6B5010] font-medium">Featured Services</h2>
            <div className="divider-accent mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 reveal">
            {/* Wedding Photography Card */}
            <div className="service-card" onClick={() => navigate('/services/wedding')} data-testid="wedding-service-card">
              <div className="service-card-bg">
                <img src={WEDDING_GALLERY[0].url} alt="Wedding Photography" />
              </div>
              <div className="service-card-overlay" />
              <div className="service-card-content">
                <Heart className="mb-4" size={32} />
                <h3 className="font-playfair text-3xl font-medium mb-2">Wedding Photography</h3>
                <p className="text-white/80 mb-4">Capture the magic of your special day with our elegant wedding photography services.</p>
                <span className="inline-flex items-center gap-2 text-[#F7C52B]">
                  View Gallery <ChevronRight size={16} />
                </span>
              </div>
            </div>

            {/* Baby Photography Card */}
            <div className="service-card" onClick={() => navigate('/services/baby')} data-testid="baby-service-card">
              <div className="service-card-bg">
                <img src={BABY_GALLERY[0].url} alt="Baby Photography" />
              </div>
              <div className="service-card-overlay" />
              <div className="service-card-content">
                <Baby className="mb-4" size={32} />
                <h3 className="font-playfair text-3xl font-medium mb-2">Baby Photography</h3>
                <p className="text-white/80 mb-4">Precious moments of your little ones captured with love and tenderness.</p>
                <span className="inline-flex items-center gap-2 text-[#F7C52B]">
                  View Gallery <ChevronRight size={16} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section-soft py-24 md:py-32" data-testid="why-choose-us">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 reveal">
            <p className="text-[#F7C52B] uppercase tracking-[0.2em] text-sm mb-3">Why Choose Us</p>
            <h2 className="font-playfair text-4xl md:text-5xl text-[#6B5010] font-medium">The Dishu Difference</h2>
            <div className="divider-accent mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 reveal">
            {features.map((feature, index) => (
              <div key={index} className="feature-card text-center p-8 rounded-2xl bg-white card-hover" data-testid={`feature-${index}`}>
                <div className="feature-icon mx-auto">
                  <feature.icon size={28} className="text-[#8B6914]" />
                </div>
                <h3 className="font-playfair text-xl text-[#6B5010] font-medium mb-3">{feature.title}</h3>
                <p className="text-[#6B5010]/50 font-manrope">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-white py-24" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-6 text-center reveal">
          <h2 className="font-playfair text-4xl md:text-5xl text-[#6B5010] font-medium mb-6">
            Ready to Create Beautiful Memories?
          </h2>
          <p className="text-[#6B5010]/60 text-lg mb-10 max-w-2xl mx-auto">
            Let us capture your special moments with the artistry and care they deserve. Book your session today.
          </p>
          <button onClick={() => navigate('/contact')} className="btn-premium" data-testid="cta-book-btn">
            Book Your Session
          </button>
        </div>
      </section>
    </div>
  );
};

// Services Page Component - Landing Page
const ServicesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-24" data-testid="services-page">
      {/* Header */}
      <section className="section-soft py-20 text-center">
        <p className="text-[#F7C52B] uppercase tracking-[0.2em] text-sm mb-3">What We Offer</p>
        <h1 className="font-playfair text-5xl md:text-6xl text-[#6B5010] font-medium">Our Services</h1>
        <div className="divider-accent mx-auto mt-4"></div>
        <p className="text-[#6B5010]/60 max-w-2xl mx-auto mt-6">
          We specialize in capturing life's most precious moments with elegance and artistry.
        </p>
      </section>

      {/* Service Cards */}
      <section className="py-24 section-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Wedding Photography Card */}
            <div 
              className="service-card cursor-pointer" 
              onClick={() => navigate('/services/wedding')} 
              data-testid="wedding-service-card"
            >
              <div className="service-card-bg">
                <img src={WEDDING_GALLERY[0].url} alt="Wedding Photography" />
              </div>
              <div className="service-card-overlay" />
              <div className="service-card-content">
                <Heart className="mb-4" size={32} />
                <h3 className="font-playfair text-3xl font-medium mb-2">Wedding Photography</h3>
                <p className="text-white/80 mb-4">Capture the magic of your special day with our elegant wedding photography services.</p>
                <span className="inline-flex items-center gap-2 text-[#F7C52B]">
                  View Gallery <ChevronRight size={16} />
                </span>
              </div>
            </div>

            {/* Baby Photography Card */}
            <div 
              className="service-card cursor-pointer" 
              onClick={() => navigate('/services/baby')} 
              data-testid="baby-service-card"
            >
              <div className="service-card-bg">
                <img src={BABY_GALLERY[0].url} alt="Baby Photography" />
              </div>
              <div className="service-card-overlay" />
              <div className="service-card-content">
                <Baby className="mb-4" size={32} />
                <h3 className="font-playfair text-3xl font-medium mb-2">Baby Photography</h3>
                <p className="text-white/80 mb-4">Precious moments of your little ones captured with love and tenderness.</p>
                <span className="inline-flex items-center gap-2 text-[#F7C52B]">
                  View Gallery <ChevronRight size={16} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Wedding Shoot Page Component
const WeddingPage = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleImageClick = (item) => {
    setSelectedItem(item);
    setIsLightboxOpen(true);
  };

  return (
    <div className="pt-24" data-testid="wedding-page">
      {/* Header */}
      <section className="section-soft py-20 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Heart className="text-[#F7C52B]" size={28} />
          <p className="text-[#F7C52B] uppercase tracking-[0.2em] text-sm">Wedding Photography</p>
        </div>
        <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl text-[#6B5010] font-medium">
          Your Love Story, Beautifully Told
        </h1>
        <div className="divider-accent mx-auto mt-4"></div>
        <p className="text-[#6B5010]/60 max-w-2xl mx-auto mt-6 px-4">
          Your wedding day is one of the most important days of your life. We capture every emotion, every glance, and every detail with artistry and care.
        </p>
      </section>

      {/* Wedding Services List */}
      <section className="py-16 section-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {['Pre-Wedding Shoots', 'Engagement Sessions', 'Wedding Day Coverage', 'Album Design'].map((service, i) => (
              <div key={i} className="p-4 bg-[#FFFBF5] rounded-xl">
                <Star className="text-[#F7C52B] mx-auto mb-2" size={20} />
                <p className="text-[#6B5010] text-sm font-medium">{service}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wedding Gallery */}
      <section className="py-24 section-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl text-[#6B5010] font-medium">Wedding Gallery</h2>
            <div className="divider-accent mx-auto mt-4"></div>
          </div>

          <div className="services-gallery mb-12" data-testid="wedding-gallery">
            {WEDDING_GALLERY.map((item) => (
              <div 
                key={item.id}
                className="services-gallery-item"
                onClick={() => handleImageClick(item)}
                data-testid={`wedding-gallery-item-${item.id}`}
              >
                <img src={item.url} alt={item.couple} loading="lazy" />
              </div>
            ))}
          </div>

          <div className="text-center">
            <button onClick={() => navigate('/contact')} className="btn-premium" data-testid="wedding-book-btn">
              Book Wedding Shoot
            </button>
          </div>
        </div>
      </section>

      <LightboxModal 
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        item={selectedItem}
        type="wedding"
      />
    </div>
  );
};

// Baby Shoot Page Component
const BabyPage = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleImageClick = (item) => {
    setSelectedItem(item);
    setIsLightboxOpen(true);
  };

  return (
    <div className="pt-24" data-testid="baby-page">
      {/* Header */}
      <section className="section-soft py-20 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Baby className="text-[#F7C52B]" size={28} />
          <p className="text-[#F7C52B] uppercase tracking-[0.2em] text-sm">Baby Photography</p>
        </div>
        <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl text-[#6B5010] font-medium">
          Tiny Miracles, Forever Treasured
        </h1>
        <div className="divider-accent mx-auto mt-4"></div>
        <p className="text-[#6B5010]/60 max-w-2xl mx-auto mt-6 px-4">
          The early days of your baby's life are fleeting and precious. We create timeless images that you'll treasure forever.
        </p>
      </section>

      {/* Baby Services List */}
      <section className="py-16 section-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {['Newborn (5-14 days)', 'Monthly Milestones', 'First Birthday', 'Family Portraits'].map((service, i) => (
              <div key={i} className="p-4 bg-[#FFFBF5] rounded-xl">
                <Star className="text-[#F7C52B] mx-auto mb-2" size={20} />
                <p className="text-[#6B5010] text-sm font-medium">{service}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Baby Gallery */}
      <section className="py-24 section-soft">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl text-[#6B5010] font-medium">Baby Gallery</h2>
            <div className="divider-accent mx-auto mt-4"></div>
          </div>

          <div className="services-gallery mb-12" data-testid="baby-gallery">
            {BABY_GALLERY.map((item) => (
              <div 
                key={item.id}
                className="services-gallery-item"
                onClick={() => handleImageClick(item)}
                data-testid={`baby-gallery-item-${item.id}`}
              >
                <img src={item.url} alt={item.name} loading="lazy" />
              </div>
            ))}
          </div>

          <div className="text-center">
            <button onClick={() => navigate('/contact')} className="btn-premium" data-testid="baby-book-btn">
              Book Baby Shoot
            </button>
          </div>
        </div>
      </section>

      <LightboxModal 
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        item={selectedItem}
        type="baby"
      />
    </div>
  );
};

// About Page Component
const AboutPage = () => {
  return (
    <div className="pt-24" data-testid="about-page">
      {/* Header */}
      <section className="section-soft py-20 text-center">
        <p className="text-[#F7C52B] uppercase tracking-[0.2em] text-sm mb-3">Our Story</p>
        <h1 className="font-playfair text-5xl md:text-6xl text-[#6B5010] font-medium">About Dishu Studio</h1>
        <div className="divider-accent mx-auto mt-4"></div>
      </section>

      {/* Story Section */}
      <section className="py-24 md:py-32 section-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="img-zoom rounded-2xl overflow-hidden shadow-lg">
              <img src={WEDDING_GALLERY[2].url} alt="Dishu Studio" className="w-full h-[500px] object-cover" />
            </div>
            <div>
              <h2 className="font-playfair text-4xl text-[#6B5010] font-medium mb-6">
                Where Passion Meets Artistry
              </h2>
              <div className="divider-accent mb-6"></div>
              <p className="text-[#6B5010]/60 text-lg leading-relaxed mb-6">
                Dishu Studio was born from a deep passion for storytelling through photography. Based in Surat, Gujarat, we have been capturing life's most precious moments for families across the region.
              </p>
              <p className="text-[#6B5010]/60 text-lg leading-relaxed mb-6">
                Our journey began with a simple belief: every moment deserves to be captured with care, creativity, and authenticity. Today, we continue to uphold these values in every session we undertake.
              </p>
              <p className="text-[#6B5010]/60 text-lg leading-relaxed">
                What sets us apart is our commitment to understanding your vision and translating it into photographs that exceed your expectations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-soft py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-10 rounded-2xl card-hover" data-testid="mission-card">
              <div className="w-16 h-16 rounded-full bg-[#F7C52B]/10 flex items-center justify-center mb-6">
                <Camera className="text-[#8B6914]" size={28} />
              </div>
              <h3 className="font-playfair text-2xl text-[#6B5010] font-medium mb-4">Our Mission</h3>
              <p className="text-[#6B5010]/60 leading-relaxed">
                To create timeless photographs that capture the essence of your most cherished moments, delivering an experience that is as memorable as the images we create.
              </p>
            </div>

            <div className="bg-white p-10 rounded-2xl card-hover" data-testid="vision-card">
              <div className="w-16 h-16 rounded-full bg-[#F7C52B]/10 flex items-center justify-center mb-6">
                <Star className="text-[#8B6914]" size={28} />
              </div>
              <h3 className="font-playfair text-2xl text-[#6B5010] font-medium mb-4">Our Vision</h3>
              <p className="text-[#6B5010]/60 leading-relaxed">
                To be the most trusted and beloved photography studio in Gujarat, known for our artistic excellence, warm service, and the genuine connections we build with our clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="py-24 section-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl text-[#6B5010] font-medium">Our Work Speaks</h2>
            <div className="divider-accent mx-auto mt-4"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[WEDDING_GALLERY[3], BABY_GALLERY[1], WEDDING_GALLERY[5], BABY_GALLERY[3]].map((img, i) => (
              <div key={i} className="img-zoom rounded-lg overflow-hidden aspect-square shadow-md">
                <img src={img.url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Contact Page Component
const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service_type: 'Wedding',
    preferred_date: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${API}/bookings`, formData);
      toast.success('Booking submitted successfully! We will contact you soon.');
      setFormData({
        name: '',
        phone: '',
        email: '',
        service_type: 'Wedding',
        preferred_date: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to submit booking. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24" data-testid="contact-page">
      {/* Header */}
      <section className="section-soft py-20 text-center">
        <p className="text-[#F7C52B] uppercase tracking-[0.2em] text-sm mb-3">Get In Touch</p>
        <h1 className="font-playfair text-5xl md:text-6xl text-[#6B5010] font-medium">Contact Us</h1>
        <div className="divider-accent mx-auto mt-4"></div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-24 section-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Booking Form */}
            <div className="booking-form" data-testid="booking-form">
              <h2 className="font-playfair text-3xl text-[#6B5010] font-medium mb-2">Book Your Session</h2>
              <div className="divider-accent mb-8"></div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[#6B5010] text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-underline"
                    placeholder="Enter your name"
                    data-testid="input-name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[#6B5010] text-sm font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="input-underline"
                      placeholder="Enter phone number"
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <label className="block text-[#6B5010] text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-underline"
                      placeholder="Enter email"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[#6B5010] text-sm font-medium mb-2">Service Type</label>
                    <select
                      name="service_type"
                      value={formData.service_type}
                      onChange={handleChange}
                      className="input-underline cursor-pointer"
                      data-testid="select-service"
                    >
                      <option value="Wedding">Wedding Photography</option>
                      <option value="Baby">Baby Photography</option>
                      <option value="Event">Event Photography</option>
                        <option value="Other">Other Photography</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#6B5010] text-sm font-medium mb-2">Preferred Date</label>
                    <input
                      type="date"
                      name="preferred_date"
                      value={formData.preferred_date}
                      onChange={handleChange}
                      required
                      className="input-underline cursor-pointer"
                      data-testid="input-date"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#6B5010] text-sm font-medium mb-2">Message (Optional)</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="input-underline resize-none"
                    placeholder="Tell us about your vision..."
                    data-testid="input-message"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-premium w-full flex items-center justify-center gap-2"
                  data-testid="submit-booking-btn"
                >
                  {isSubmitting ? (
                    <div className="spinner w-5 h-5" />
                  ) : (
                    <>
                      <Calendar size={18} />
                      Submit Booking
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info & Map */}
            <div className="space-y-8">
              <div className="bg-[#FEFDFB] p-8 rounded-2xl" data-testid="contact-info">
                <h3 className="font-playfair text-2xl text-[#6B5010] font-medium mb-2">Contact Information</h3>
                <div className="divider-accent mb-6"></div>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <MapPin className="text-[#F7C52B]" size={20} />
                    </div>
                    <div>
                      <h4 className="text-[#6B5010] font-medium mb-1">Studio Address</h4>
                      <p className="text-[#6B5010]/60">B-12 Gopinath Complex, Lajamani Chowk, Mota Varachha, Surat, Gujarat, India</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Mail className="text-[#F7C52B]" size={20} />
                    </div>
                    <div>
                      <h4 className="text-[#6B5010] font-medium mb-1">Email Us</h4>
                      <a href="mailto:dishuvekariya5@gmail.com" className="text-[#6B5010]/60 hover:text-[#F7C52B]">
                        dishumukesh@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Map */}
              <div className="contact-map h-[300px] rounded-2xl overflow-hidden shadow-md" data-testid="google-map">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.8661869508957!2d72.86754827535654!3d21.22069998059673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f3a0a85b8e3%3A0x8b2b9f5b8f8b8b8b!2sGopinath%20Complex%2C%20Mota%20Varachha%2C%20Surat%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1709816012345!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Dishu Studio Location"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Admin Login Component
const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/auth/login`, credentials);
      localStorage.setItem('adminToken', response.data.access_token);
      onLogin();
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEFDFB] p-6" data-testid="admin-login">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="Dishu Studio" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="font-playfair text-2xl text-[#6B5010]">Admin Login</h1>
          <div className="divider-accent mx-auto mt-3"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm" data-testid="login-error">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[#6B5010] text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="w-full px-4 py-3 border border-[#F7C52B]/30 rounded-lg focus:outline-none focus:border-[#F7C52B]"
              placeholder="Enter username"
              data-testid="admin-username"
            />
          </div>

          <div>
            <label className="block text-[#6B5010] text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-4 py-3 border border-[#F7C52B]/30 rounded-lg focus:outline-none focus:border-[#F7C52B]"
              placeholder="Enter password"
              data-testid="admin-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-premium w-full"
            data-testid="admin-login-btn"
          >
            {isLoading ? <div className="spinner w-5 h-5 mx-auto" /> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = ({ onLogout }) => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const token = localStorage.getItem('adminToken');

useEffect(() => {
  fetchData();
}, [fetchData]);

  const fetchData = async () => {
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        axios.get(`${API}/bookings`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/stats`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setBookings(bookingsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        onLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/bookings/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Booking ${status.toLowerCase()}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      await axios.delete(`${API}/bookings/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Booking deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete booking');
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = filterService === 'all' || b.service_type === filterService;
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchesSearch && matchesService && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFDFB]">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFDFB]" data-testid="admin-dashboard">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Dishu Studio" className="h-10 w-10" />
            <span className="font-playfair text-xl text-[#8B6914]">Admin Dashboard</span>
          </div>
          <button onClick={onLogout} className="text-[#6B5010] hover:text-[#F7C52B] transition-colors" data-testid="admin-logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8" data-testid="admin-stats">
            {[
              { label: 'Total', value: stats.total, color: 'bg-[#6B5010]' },
              { label: 'Pending', value: stats.pending, color: 'bg-[#F7C52B]' },
              { label: 'Confirmed', value: stats.confirmed, color: 'bg-green-500' },
              { label: 'Cancelled', value: stats.cancelled, color: 'bg-red-400' },
              { label: 'Wedding', value: stats.wedding, color: 'bg-pink-400' },
              { label: 'Baby', value: stats.baby, color: 'bg-blue-400' },
            ].map((stat, i) => (
              <div key={i} className="admin-card p-4 text-center">
                <div className={`w-3 h-3 ${stat.color} rounded-full mx-auto mb-2`} />
                <p className="text-2xl font-bold text-[#6B5010]">{stat.value}</p>
                <p className="text-sm text-[#6B5010]/50">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-4 shadow-sm" data-testid="admin-filters">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-[#F7C52B]/20 rounded-lg focus:outline-none focus:border-[#F7C52B]"
            data-testid="search-input"
          />
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="px-4 py-2 border border-[#F7C52B]/20 rounded-lg focus:outline-none focus:border-[#F7C52B]"
            data-testid="filter-service"
          >
            <option value="all">All Services</option>
            <option value="Wedding">Wedding</option>
            <option value="Baby">Baby</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-[#F7C52B]/20 rounded-lg focus:outline-none focus:border-[#F7C52B]"
            data-testid="filter-status"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm" data-testid="bookings-table">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[#6B5010]/50">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} data-testid={`booking-row-${booking.id}`}>
                      <td>
                        <div className="font-medium text-[#6B5010]">{booking.name}</div>
                        <div className="text-sm text-[#6B5010]/50">{booking.email}</div>
                      </td>
                      <td className="text-[#6B5010]/60">{booking.phone}</td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          booking.service_type === 'Wedding' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {booking.service_type}
                        </span>
                      </td>
                      <td className="text-[#6B5010]/60">{booking.preferred_date}</td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          booking.status === 'Pending' ? 'status-pending' :
                          booking.status === 'Confirmed' ? 'status-confirmed' : 'status-cancelled'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {booking.status !== 'Confirmed' && (
                            <button
                              onClick={() => updateStatus(booking.id, 'Confirmed')}
                              className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 transition-colors"
                              data-testid={`confirm-btn-${booking.id}`}
                            >
                              Confirm
                            </button>
                          )}
                          {booking.status !== 'Cancelled' && (
                            <button
                              onClick={() => updateStatus(booking.id, 'Cancelled')}
                              className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-sm hover:bg-orange-100 transition-colors"
                              data-testid={`cancel-btn-${booking.id}`}
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => deleteBooking(booking.id)}
                            className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
                            data-testid={`delete-btn-${booking.id}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Page Wrapper
const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      axios.get(`${API}/auth/verify`, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => setIsLoggedIn(true))
        .catch(() => {
          localStorage.removeItem('adminToken');
          setIsLoggedIn(false);
        });
    }
  }, []);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
};

// Main Layout with Navigation & Footer
const MainLayout = ({ children }) => {
  return (
    <>
      <Navigation />
      <main>{children}</main>
      <Footer />
    </>
  );
};

// Main App Component
function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    const introShown = sessionStorage.getItem('introShown');
    if (introShown) {
      setShowIntro(false);
      setIntroComplete(true);
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setIntroComplete(true);
    sessionStorage.setItem('introShown', 'true');
  };

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      
      {introComplete && (
        <BrowserRouter>
          <Routes>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
            <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
            <Route path="/services" element={<MainLayout><ServicesPage /></MainLayout>} />
            <Route path="/services/wedding" element={<MainLayout><WeddingPage /></MainLayout>} />
            <Route path="/services/baby" element={<MainLayout><BabyPage /></MainLayout>} />
            <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />
          </Routes>
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;
