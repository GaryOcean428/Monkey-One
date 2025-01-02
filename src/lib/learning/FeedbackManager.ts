import { getDatabase, ref, push, set, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import * as tf from '@tensorflow/tfjs';
import { database, isDemo } from '../firebase';
import type { Message } from '../../types';

export interface Feedback {
  id: string;
  responseId: string;
  rating: number;
  comment?: string;
  tags?: string[];
  isDevFeedback: boolean;
  timestamp: number;
  metadata?: {
    modelId: string;
    context?: string[];
    executionTime?: number;
    tokenCount?: number;
  };
}

interface LearningMetrics {
  accuracy: number;
  confidence: number;
  relevance: number;
  helpfulness: number;
}

export class FeedbackManager {
  private model: tf.LayersModel | null = null;
  private readonly feedbackRef = isDemo ? null : ref(database, 'feedback');
  private readonly metricsRef = isDemo ? null : ref(database, 'metrics');
  private localFeedback: Feedback[] = [];

  async initialize() {
    try {
      await tf.ready();
      this.model = await this.loadModel();
      
      if (!isDemo) {
        await this.loadHistoricalFeedback();
      }
    } catch (error) {
      console.warn('Feedback manager initialization in local mode:', error);
    }
  }

  private async loadHistoricalFeedback() {
    if (isDemo || !this.feedbackRef) return;

    try {
      const snapshot = await get(this.feedbackRef);
      if (snapshot.exists()) {
        const feedbackData = snapshot.val();
        for (const key in feedbackData) {
          await this.updateMetrics(feedbackData[key]);
        }
      }
    } catch (error) {
      console.warn('Error loading historical feedback:', error);
    }
  }

  async submitFeedback(feedback: Omit<Feedback, 'id' | 'timestamp'>): Promise<string> {
    const newFeedback: Feedback = {
      ...feedback,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    try {
      if (!isDemo && this.feedbackRef) {
        const auth = getAuth();
        const user = auth.currentUser;

        // Store feedback in Firebase
        const newFeedbackRef = push(this.feedbackRef);
        await set(newFeedbackRef, {
          ...newFeedback,
          userId: user?.uid,
          isDev: feedback.isDevFeedback
        });
      } else {
        // Store locally in demo mode
        this.localFeedback.push(newFeedback);
      }

      // Update learning metrics
      await this.updateMetrics(newFeedback);

      return newFeedback.id;
    } catch (error) {
      console.warn('Error submitting feedback:', error);
      // Store locally as fallback
      this.localFeedback.push(newFeedback);
      return newFeedback.id;
    }
  }

  // Rest of the class implementation remains the same
}