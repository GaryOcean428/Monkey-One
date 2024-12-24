import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageSquare, Tag, Wrench } from 'lucide-react'; // Changed Tool to Wrench
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useFeedbackStore } from '../../store/feedbackStore';
import type { Message } from '../../types';

// Rest of the file remains the same, just update the icon usage
export function FeedbackControls({ message }: FeedbackControlsProps) {
  // ... existing code ...

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 flex items-center gap-2"
      >
        {/* ... other buttons ... */}

        {isDevMode && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddTag('bug')}
              className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
            >
              <Wrench className="w-4 h-4" /> {/* Changed Tool to Wrench */}
            </Button>

            {/* ... other buttons ... */}
          </>
        )}
      </motion.div>

      {/* ... rest of the content ... */}
    </>
  );
}