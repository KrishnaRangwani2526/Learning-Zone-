import { MapPin, Phone } from "lucide-react";

const Footer = () => (
  <footer className="bg-muted/20 py-12 border-t border-border mt-12">
    <div className="container px-4 md:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-8 text-center md:text-left">
        <div className="max-w-sm">
          <h3 className="font-display text-2xl text-[#0F2C59] mb-4" style={{ fontFamily: "'Trajan Pro', serif", fontWeight: "bold" }}>
            Learning Zone
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Empowering students with expert guidance and a proven track record of success in competitive examinations.
          </p>
        </div>
        
        <div className="flex flex-col items-center md:items-end">
          <h4 className="font-medium text-foreground mb-4">Contact Information</h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex items-start text-left gap-3 max-w-xs">
              <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
              <span>Learning Zone, in front of jain mandir, sector 4, Hiran Magri, Udaipur</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-primary shrink-0" />
              <a href="tel:+919928452506" className="hover:text-primary transition-colors">9928452506</a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm text-muted-foreground pt-8 border-t border-border/50">
        © {new Date().getFullYear()} <span style={{ fontFamily: "'Trajan Pro', serif", fontWeight: "bold" }}>Learning Zone</span>. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
