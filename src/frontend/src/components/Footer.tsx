import { memo } from 'react';
import { SiFacebook, SiX, SiInstagram, SiLinkedin } from 'react-icons/si';
import { Heart } from 'lucide-react';

type Page = 'home' | 'mock-tests' | 'courses' | 'syllabus' | 'progress' | 'profile' | 'admin' | 'payment-success' | 'payment-failure';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer = memo(function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' ? window.location.hostname : 'examxpress';

  const socialLinks = [
    { icon: SiFacebook, href: '#', label: 'Facebook', color: 'brand-blue' },
    { icon: SiX, href: '#', label: 'X (Twitter)', color: 'brand-red' },
    { icon: SiInstagram, href: '#', label: 'Instagram', color: 'brand-red' },
    { icon: SiLinkedin, href: '#', label: 'LinkedIn', color: 'brand-blue' },
  ];

  const quickLinks = [
    { page: 'mock-tests' as Page, label: 'Mock Tests' },
    { page: 'courses' as Page, label: 'Courses' },
    { page: 'syllabus' as Page, label: 'Syllabus' },
    { page: 'progress' as Page, label: 'Progress' },
  ];

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-brand-red">ExamXpress</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your comprehensive platform for CUET UG preparation with mock tests, video courses, and detailed syllabus.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`p-2 rounded-full bg-${color}/10 text-${color} hover:bg-${color}/20 transition-colors`}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-brand-blue">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map(({ page, label }) => (
                <li key={page}>
                  <button
                    onClick={() => onNavigate(page)}
                    className="text-sm text-muted-foreground hover:text-brand-blue transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-brand-red">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: exam.xpress.cuetug@gmail.com</li>
              <li>Phone: 9161514080</li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} ExamXpress. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Built with <Heart className="h-4 w-4 text-brand-red fill-brand-red" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(appIdentifier)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue hover:text-brand-blue/80 font-medium transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
