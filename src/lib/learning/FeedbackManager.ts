import * as tf from '@tensorflow/tfjs'
import { supabase } from '../supabase/client'
import { v4 as uuidv4 } from 'uuid'

export interface Feedback {
  id: string
  responseId: string
  rating: number
  comment?: string
  tags?: string[]
  isDevFeedback: boolean
  timestamp: number
  metadata?: {
    modelId: string
    context?: string[]
    executionTime?: number
    tokenCount?: number
  }
}

interface LearningMetrics {
  accuracy: number
  confidence: number
  relevance: number
  helpfulness: number
}

export class FeedbackManager {
  private model: tf.LayersModel | null = null
  private localFeedback: Feedback[] = []
  private subscriptions: { [key: string]: ReturnType<typeof supabase.channel> } = {}

  async initialize() {
    try {
      await tf.ready()
      this.model = await this.loadModel()
      await this.loadHistoricalFeedback()
    } catch (error) {
      console.warn('Feedback manager initialization in local mode:', error)
    }
  }

  private async loadHistoricalFeedback() {
    try {
      const { data: feedbackData, error } = await supabase
        .from('feedback')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000)

      if (error) throw error

      if (feedbackData) {
        for (const feedback of feedbackData) {
          await this.updateMetrics(feedback)
        }
      }
    } catch (error) {
      console.warn('Error loading historical feedback:', error)
    }
  }

  async submitFeedback(feedback: Omit<Feedback, 'id' | 'timestamp'>): Promise<string> {
    const newFeedback: Feedback = {
      ...feedback,
      id: uuidv4(),
      timestamp: Date.now(),
    }

    try {
      const { data: session } = await supabase.auth.getSession()
      const userId = session?.session?.user?.id

      const { error } = await supabase.from('feedback').insert({
        ...newFeedback,
        user_id: userId,
        is_dev: feedback.isDevFeedback,
      })

      if (error) throw error

      // Update learning metrics
      await this.updateMetrics(newFeedback)

      // Set up real-time subscription for this feedback
      this.subscriptions[newFeedback.id] = supabase
        .channel(`feedback_${newFeedback.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'feedback',
            filter: `id=eq.${newFeedback.id}`,
          },
          payload => {
            console.log('Feedback updated:', payload)
          }
        )
        .subscribe()

      return newFeedback.id
    } catch (error) {
      console.warn('Error submitting feedback:', error)
      // Store locally as fallback
      this.localFeedback.push(newFeedback)
      return newFeedback.id
    }
  }

  private async updateMetrics(feedback: Feedback) {
    try {
      const { data: existingMetrics, error: fetchError } = await supabase
        .from('learning_metrics')
        .select('*')
        .eq('model_id', feedback.metadata?.modelId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned"
        throw fetchError
      }

      const newMetrics = this.calculateMetrics(feedback, existingMetrics)

      const { error: upsertError } = await supabase.from('learning_metrics').upsert({
        model_id: feedback.metadata?.modelId,
        ...newMetrics,
        last_updated: new Date().toISOString(),
      })

      if (upsertError) throw upsertError
    } catch (error) {
      console.warn('Error updating metrics:', error)
    }
  }

  private calculateMetrics(feedback: Feedback, existingMetrics?: LearningMetrics): LearningMetrics {
    // Implement your metrics calculation logic here
    // This is just a simple example
    const defaultMetrics: LearningMetrics = {
      accuracy: 0,
      confidence: 0,
      relevance: 0,
      helpfulness: 0,
    }

    if (!existingMetrics) {
      return {
        ...defaultMetrics,
        helpfulness: feedback.rating / 5,
      }
    }

    // Calculate rolling average
    const weight = 0.1 // New feedback weight
    return {
      accuracy: existingMetrics.accuracy * (1 - weight) + (feedback.rating / 5) * weight,
      confidence: existingMetrics.confidence,
      relevance: existingMetrics.relevance,
      helpfulness: existingMetrics.helpfulness * (1 - weight) + (feedback.rating / 5) * weight,
    }
  }

  private async loadModel(): Promise<tf.LayersModel> {
    // Implement model loading logic
    throw new Error('Model loading not implemented')
  }

  async getFeedback(id: string): Promise<Feedback | null> {
    try {
      const { data, error } = await supabase.from('feedback').select('*').eq('id', id).single()

      if (error) throw error
      return data
    } catch (error) {
      console.warn('Error fetching feedback:', error)
      return this.localFeedback.find(f => f.id === id) || null
    }
  }

  async getMetrics(modelId: string): Promise<LearningMetrics | null> {
    try {
      const { data, error } = await supabase
        .from('learning_metrics')
        .select('*')
        .eq('model_id', modelId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.warn('Error fetching metrics:', error)
      return null
    }
  }

  // Cleanup subscriptions when they're no longer needed
  cleanup() {
    Object.values(this.subscriptions).forEach(subscription => {
      subscription.unsubscribe()
    })
    this.subscriptions = {}
  }
}
