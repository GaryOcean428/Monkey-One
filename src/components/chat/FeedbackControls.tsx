import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageSquare, Tag, Wrench, Flag } from 'lucide-react'; // Changed Tool to Wrench
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useFeedbackStore } from '../../store/feedbackStore';
import type { Message } from '../../types';

interface FeedbackControlsProps {
  message: Message;
}

export function FeedbackControls({ message }: FeedbackControlsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const { addTag, isDevMode } = useFeedbackStore();

  const handleAddTag = (tag: string) => {
    addTag(message.id, tag);
  };

  const handleOpenDialog = (rating: number) => {
    setRating(rating);
    setIsDialogOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 flex items-center gap-2"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenDialog(1)}
          className="text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
        >
          <ThumbsUp className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenDialog(-1)}
          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <ThumbsDown className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAddTag('report')}
          className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
        >
          <Flag className="w-4 h-4" />
        </Button>

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
          </>
        )}
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Add any additional comments..."
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button>
              Submit Feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
