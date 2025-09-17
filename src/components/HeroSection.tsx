import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

// High-quality Nairobi CBD background images with fallback system
const getBackgroundImages = () => {
  const isProduction = window.location.hostname.includes('onrender.com') || 
                      window.location.hostname.includes('herokuapp.com') ||
                      !window.location.hostname.includes('localhost');
  
  console.log('🖼️ Environment detection:', {
    hostname: window.location.hostname,
    isProduction
  });
  
  if (isProduction) {
    return [
      "/static/nairobi-cbd-skyline.jpg",
      "/static/nairobi-city-center.jpg", 
      "/static/nairobi-business-district.jpg",
      "/static/nairobi-downtown.jpg"
    ];
  } else {
    return [
      "/nairobi-cbd-skyline.jpg",
      "/nairobi-city-center.jpg",
      "/nairobi-business-district.jpg", 
      "/nairobi-downtown.jpg"
    ];
  }
};

const backgroundImages = getBackgroundImages();
console.log('🖼️ Background images paths:', backgroundImages);

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    console.log('🖼️ Starting image preload...');
    
    // Preload all images
    const preloadImages = backgroundImages.map((src, index) => {
      const img = new Image();
      img.onload = () => {
        console.log(`✅ Image ${index + 1} loaded successfully:`, src);
        setImageLoaded(true);
      };
      img.onerror = (error) => {
        console.error(`❌ Failed to load image ${index + 1}:`, src, error);
        setImageLoaded(true); // Still set loaded to show fallback
      };
      img.src = src;
      return img;
    });

    // Rotate images every 8 seconds
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % backgroundImages.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image - Rotating high-quality Kenya safari images */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
          opacity: imageLoaded ? 1 : 0.9,
        }}
        onLoad={() => console.log('🖼️ Background div loaded')}
        onError={() => console.log('❌ Background div error')}
      >
        {/* Fallback background color in case image fails to load */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-500" />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center mb-4">
          <MapPin className="h-6 w-6 text-primary mr-2" />
          <span className="text-lg text-white/90 font-medium">Are you in Kenya?</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Experience Authentic{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-safari-sunset">
            Kenya
          </span>{" "}
          with Richard
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-6 max-w-3xl mx-auto leading-relaxed">
          Reliable Taxi Service with Richard - Your trusted driver for safe, comfortable rides around Nairobi and beyond. 
          Airport, office and corporate transfers, city tours, and personalized trips across Kenya.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold group"
          >
            Plan Your Adventure
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-foreground px-8 py-4 text-lg font-semibold"
          >
            View Gallery
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">1000+</div>
            <div className="text-white/80">Satisfied Passengers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">20+</div>
            <div className="text-white/80">Years of Safe Driving</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">100+</div>
            <div className="text-white/80">Destinations</div>
          </div>
        </div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? 'bg-primary scale-125' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`View image ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-1 h-12 bg-gradient-to-b from-primary to-transparent rounded-full" />
      </div>
    </section>
  );
};

export default HeroSection;