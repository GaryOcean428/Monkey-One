import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Star, Trophy } from 'lucide-react';

interface SuccessIndicatorProps {
  show: boolean;
  type: 'achievement' | 'milestone' | 'completion';
  message: string;
}

export function SuccessIndicator({ show, type, message }: SuccessIndicatorProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            {type === 'achievement' && <Trophy className="w-5 h-5" />}
            {type === 'milestone' && <Star className="w-5 h-5" />}
            {type === 'completion' && <CheckCircle className="w-5 h-5" />}
            <span className="font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}