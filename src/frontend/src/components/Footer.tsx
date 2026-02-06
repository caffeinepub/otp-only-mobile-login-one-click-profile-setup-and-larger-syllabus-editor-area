import { memo } from 'react';
import { useGetContactInfo } from '../hooks/useQueries';
import { Mail, Phone } from 'lucide-react';

const Footer = memo(function Footer() {
  const { data: contactInfo } = useGetContactInfo();

  return (
    <footer className="border-t-2 border-blue-accent/20 bg-gradient-to-br from-blue-accent/10 to-accent/10 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/assets/IMG_20260121_194813_007.webp" 
                alt="Exam Xpresss Logo" 
                className="h-10 w-10 rounded-full shadow-md ring-2 ring-blue-accent/30" 
                loading="lazy"
              />
              <div>
                <h3 className="font-bold text-lg text-blue-accent">Exam Xpresss</h3>
                <p className="text-sm text-blue-accent/80 font-semibold">CUET UG Preparation</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your complete CUET UG exam preparation platform
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-blue-accent text-lg">Contact Us</h4>
            <div className="space-y-2">
              {contactInfo && (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-accent transition-colors">
                    <Mail className="h-4 w-4 text-blue-accent/70" />
                    <a href={`mailto:${contactInfo.email}`} className="hover:underline font-medium">
                      {contactInfo.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-accent transition-colors">
                    <Phone className="h-4 w-4 text-blue-accent/70" />
                    <a href={`tel:${contactInfo.phone}`} className="hover:underline font-medium">
                      {contactInfo.phone}
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="font-bold mb-4 text-blue-accent text-lg">About Us</h4>
            <p className="text-sm text-muted-foreground">
              Exam Xpresss is dedicated to providing quality educational content and mock tests for CUET UG candidates.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-blue-accent/20 text-center text-sm text-muted-foreground">
          <p>© 2025 Exam Xpresss CUET UG. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
