import { useState } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok, FaSnapchat } from "react-icons/fa6";
import { Share2, X } from "lucide-react";

export default function FloatingSocialMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dragControls = useDragControls();

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

  // Subtle sound effect for opening menu (upward swoosh)
  const playOpenSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  };

  // Subtle sound effect for closing menu (downward swoosh)
  const playCloseSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.12);

    gainNode.gain.setValueAtTime(0.18, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.12);
  };

  const toggleMenu = () => {
    if (!isOpen) {
      playOpenSound();
    } else {
      playCloseSound();
    }
    setIsOpen(!isOpen);
  };

  // Calculate positions for icons in a vertical list
  const getIconPosition = (index: number) => {
    const spacing = 70; // Vertical spacing between icons
    return {
      x: 0,
      y: -(index * spacing + 80), // Stack vertically above button
    };
  };

  return (
    <div className="fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-[150]" data-testid="container-floating-social">
      {/* Toggle Button */}
      <motion.button
        onClick={toggleMenu}
        className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center relative"
        style={{
          boxShadow: "0 4px 20px rgba(119, 96, 168, 0.4)",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-social-toggle"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-primary" />
          ) : (
            <Share2 className="w-6 h-6 text-primary" />
          )}
        </motion.div>
      </motion.button>

      {/* Draggable Social Icons Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragControls={dragControls}
            dragConstraints={{
              top: -400,
              left: -200,
              right: 200,
              bottom: 100,
            }}
            dragElastic={0.1}
            dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
            className="absolute bottom-0 right-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            data-testid="container-draggable-icons"
          >
            {/* Drag Handle */}
            <motion.div
              onPointerDown={(e) => dragControls.start(e)}
              className="absolute bottom-0 left-[-40px] w-8 h-24 flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 0.5 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              data-testid="drag-handle"
            >
              <div className="w-1 h-12 bg-primary/40 rounded-full" />
            </motion.div>

            {socialLinks.map((social, index) => {
              const position = getIconPosition(index);
              const Icon = social.icon;
              
              return (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform pointer-events-auto"
                  style={{
                    bottom: 0,
                    right: 0,
                    boxShadow: "0 2px 12px rgba(119, 96, 168, 0.3)",
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
                    duration: 0.4,
                    delay: index * 0.08,
                    ease: "easeOut"
                  }}
                  aria-label={social.name}
                  data-testid={`link-floating-${social.name.toLowerCase()}`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Icon 
                    className="w-6 h-6" 
                    style={{ color: social.color }}
                  />
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
