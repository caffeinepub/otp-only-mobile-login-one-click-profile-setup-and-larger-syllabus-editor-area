import { memo } from 'react';
import { SiFacebook, SiX, SiInstagram, SiLinkedin } from 'react-icons/si';

type Page = 'home' | 'mock-tests' | 'courses' | 'syllabus' | 'progress' | 'profile' | 'admin' | 'payment-success' | 'payment-failure';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer = memo(function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: SiFacebook, href: '#', label: 'Facebook', colorClass: 'text-brand-blue hover:text-brand-blue/80' },
    { icon: SiX, href: '#', label: 'X (Twitter)', colorClass: 'text-brand-red hover:text-brand-red/80' },
    { icon: SiInstagram, href: '#', label: 'Instagram', colorClass: 'text-brand-red hover:text-brand-red/80' },
    { icon: SiLinkedin, href: '#', label: 'LinkedIn', colorClass: 'text-brand-blue hover:text-brand-blue/80' },
  ];

  const quickLinks = [
    { page: 'mock-tests' as Page, label: 'Mock Tests', colorClass: 'text-brand-red hover:text-brand-red/80' },
    { page: 'courses' as Page, label: 'Courses', colorClass: 'text-brand-blue hover:text-brand-blue/80' },
    { page: 'syllabus' as Page, label: 'Syllabus', colorClass: 'text-brand-red hover:text-brand-red/80' },
    { page: 'progress' as Page, label: 'Progress', colorClass: 'text-brand-blue hover:text-brand-blue/80' },
  ];

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-brand-red to-brand-blue flex items-center justify-center ring-2 ring-background overflow-hidden">
                <img 
                  src="/assets/generated/exam-xpresss-logo-clean.dim_512x512.png" 
                  alt="Exam Xpresss Logo" 
                  className="h-full w-full object-contain p-1"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-red to-brand-blue bg-clip-text text-transparent">
                Exam Xpresss
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your complete preparation partner for CUET UG with mock tests, video courses, and comprehensive study materials.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className={`transition-colors ${social.colorClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-brand-red">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => onNavigate(link.page)}
                    className={`text-sm transition-colors ${link.colorClass}`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4 text-brand-blue">Contact Us</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:exam.xpress.cuetug@gmail.com" className="hover:text-brand-blue transition-colors">
                  exam.xpress.cuetug@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:9161514080" className="hover:text-brand-red transition-colors">
                  +91 9161514080
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {currentYear} Exam Xpresss. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
