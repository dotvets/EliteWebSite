import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok, FaSnapchat } from "react-icons/fa6";
import { Share2 } from "lucide-react";

export default function FloatingSocialMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const socialLinks = [
    { 
      name: "WhatsApp", 
      icon: FaWhatsapp, 
      url: "https://wa.me/920011626",
      color: "#25D366"
    },
    { 
      name: "Facebook", 
      icon: FaFacebook, 
      url: "https://www.facebook.com/EliteVetKsa/",
      color: "#1877F2"
    },
    { 
      name: "Instagram", 
      icon: FaInstagram, 
      url: "https://www.instagram.com/elitevetksa/",
      color: "#E4405F"
    },
    { 
      name: "TikTok", 
      icon: FaTiktok, 
      url: "https://www.tiktok.com/@elitevetksa?_t=8bOy5ryM69C&_r=1",
      color: "#000000"
    },
    { 
      name: "Snapchat", 
      icon: FaSnapchat, 
      url: "https://www.snapchat.com/add/elitevetksa",
      color: "#FFFC00"
    },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Calculate positions for icons in a half-circle arc
  const getIconPosition = (index: number, total: number) => {
    const angle = (Math.PI / (total + 1)) * (index + 1);
    const radius = 120; // Distance from center
    return {
      x: -Math.cos(angle) * radius,
      y: -Math.sin(angle) * radius,
    };
  };

  return (
    <div className="fixed right-6 bottom-6 z-50" data-testid="container-floating-social">
      {/* Toggle Button */}
      <motion.button
        onClick={toggleMenu}
        className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center relative overflow-hidden"
        style={{
          boxShadow: "0 4px 20px rgba(142, 102, 173, 0.4)",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-social-toggle"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Share2 className="w-6 h-6 text-primary" />
        </motion.div>
      </motion.button>

      {/* Half-Circle Background */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute right-0 bottom-0 w-64 h-64 rounded-tl-full overflow-hidden pointer-events-none"
            style={{
              background: "linear-gradient(135deg, #8E66AD 0%, #BFA8CF 100%)",
              transformOrigin: "bottom right",
            }}
          />
        )}
      </AnimatePresence>

      {/* Social Icons */}
      <AnimatePresence>
        {isOpen && socialLinks.map((social, index) => {
          const position = getIconPosition(index, socialLinks.length);
          const Icon = social.icon;
          
          return (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              style={{
                bottom: "50%",
                right: "50%",
                marginBottom: "-24px",
                marginRight: "-24px",
              }}
              initial={{ 
                x: 0, 
                y: 0,
                opacity: 0,
                scale: 0
              }}
              animate={{ 
                x: position.x, 
                y: position.y,
                opacity: 1,
                scale: 1
              }}
              exit={{ 
                x: 0, 
                y: 0,
                opacity: 0,
                scale: 0
              }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeOut"
              }}
              aria-label={social.name}
              data-testid={`link-floating-${social.name.toLowerCase()}`}
            >
              <Icon 
                className="w-6 h-6" 
                style={{ color: social.color }}
              />
            </motion.a>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
