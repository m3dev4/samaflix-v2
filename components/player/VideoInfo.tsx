import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoInfoProps {
  title: string;
  description?: string;
  isVisible: boolean;
}

export function VideoInfo({ title, description, isVisible }: VideoInfoProps) {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="absolute inset-0 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
        
        <div className="absolute inset-0 bottom-20 flex flex-col justify-end p-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="inline-block px-3 py-1 mb-3 bg-player-accent/20 backdrop-blur-md rounded-md">
              <span className="text-xs font-semibold text-player-accent tracking-wider uppercase">
                En lecture
              </span>
            </div>
          </motion.div>
          
          <motion.h2 
            className="text-5xl sm:text-6xl font-bold mb-4 text-white tracking-tight"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {title}
          </motion.h2>
          
          {typeof description === 'string' && description.length > 0 && (
            <motion.p 
              className="text-base text-white/80 max-w-2xl mb-6 leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {description}
            </motion.p>
          )}
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* <button
              className="px-6 py-3 bg-player-accent hover:bg-player-accentHover text-white font-medium rounded-md 
                         shadow-lg shadow-player-accent/20 transition-all duration-300 hover:shadow-player-accent/30
                         flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
              </svg>
              Regarder maintenant
            </button> */}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
