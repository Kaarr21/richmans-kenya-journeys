import { Sun, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-safari-earth text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Sun className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Richman Travel & Tours</span>
            </div>
            <p className="text-white/80 mb-6 leading-relaxed">
              Experience the authentic beauty of Kenya with a trusted local guide. 
              From thrilling safaris to cultural immersions, we create unforgettable 
              memories that last a lifetime.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                "Home",
                "About Richard", 
                "Safari Tours",
                "Gallery",
                "Book a Tour",
                "Contact"
              ].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-white/70 hover:text-primary transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-white/90">0720912561</p>
                  <p className="text-white/70 text-sm">Call or WhatsApp</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-white/90">richkaroki@gmail.com</p>
                  <p className="text-white/70 text-sm">Quick response</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-white/90">Nairobi, Kenya</p>
                  <p className="text-white/70 text-sm">Central Business District</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 text-sm">
            © {currentYear} Richman Travel & Tours. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-white/70 hover:text-primary text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-white/70 hover:text-primary text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;