import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useFeedbackStore } from '@/store/feedbackStore';
import type { Message } from '@/types';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: Message;
  rating: number;
}

export function FeedbackDialog({ open, onOpenChange, message, rating }: FeedbackDialogProps) {
  const [comment, setComment] = useState('');
  const { submitFeedback, isSubmitting } = useFeedbackStore();

  const handleSubmit = async () => {
    await submitFeedback(message.id, rating, comment);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Provide Feedback</DialogTitle>
          <DialogDescription>
            Your feedback helps improve the AI's responses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Add any additional comments..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}