import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { FeedbackManager, type Feedback } from '../lib/learning/FeedbackManager';
import { isDemo } from '../lib/firebase';

interface FeedbackState {
  isDevMode: boolean;
  feedbackManager: FeedbackManager;
  pendingFeedback: Map<string, Partial<Feedback>>;
  isSubmitting: boolean;
  error: string | null;
  isDemoMode: boolean;
}

interface FeedbackActions {
  toggleDevMode: () => void;
  submitFeedback: (responseId: string, rating: number, comment?: string) => Promise<void>;
  updatePendingFeedback: (responseId: string, feedback: Partial<Feedback>) => void;
  clearPendingFeedback: (responseId: string) => void;
  initializeFeedbackManager: () => Promise<void>;
}

export const useFeedbackStore = create<FeedbackState & FeedbackActions>()(
  persist(
    immer((set, get) => ({
      isDevMode: false,
      feedbackManager: new FeedbackManager(),
      pendingFeedback: new Map(),
      isSubmitting: false,
      error: null,
      isDemoMode: isDemo,

      toggleDevMode: () => {
        set(state => {
          state.isDevMode = !state.isDevMode;
        });
      },

      initializeFeedbackManager: async () => {
        try {
          await get().feedbackManager.initialize();
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to initialize feedback system';
          });
        }
      },

      submitFeedback: async (responseId: string, rating: number, comment?: string) => {
        set(state => {
          state.isSubmitting = true;
          state.error = null;
        });

        try {
          const pending = get().pendingFeedback.get(responseId) || {};
          const isDevFeedback = get().isDevMode;

          await get().feedbackManager.submitFeedback({
            responseId,
            rating,
            comment,
            isDevFeedback,
            ...pending
          });

          set(state => {
            state.pendingFeedback.delete(responseId);
            state.isSubmitting = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Failed to submit feedback';
            state.isSubmitting = false;
          });
        }
      },

      updatePendingFeedback: (responseId: string, feedback: Partial<Feedback>) => {
        set(state => {
          const existing = state.pendingFeedback.get(responseId) || {};
          state.pendingFeedback.set(responseId, { ...existing, ...feedback });
        });
      },

      clearPendingFeedback: (responseId: string) => {
        set(state => {
          state.pendingFeedback.delete(responseId);
        });
      }
    })),
    {
      name: 'feedback-store',
      partialize: (state) => ({
        isDevMode: state.isDevMode
      })
    }
  )
);