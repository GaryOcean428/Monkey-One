import { test, expect } from '@playwright/test';
import { generateResponse, generateStreamingResponse } from '../src/lib/models';
import { performanceMonitor } from '../src/lib/monitoring/performance';
import { analytics } from '../src/lib/monitoring/analytics';

test.describe('Model Service E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('complete response generation flow', async ({ page }) => {
    const prompt = 'Write a hello world program in Python';
    
    // Test basic response generation
    const response = await generateResponse(prompt);
    expect(response.text).toBeTruthy();
    expect(response.usage.totalTokens).toBeGreaterThan(0);

    // Verify analytics were recorded
    const metrics = analytics.getMetrics('phi-3.5');
    expect(metrics.totalRequests).toBeGreaterThan(0);

    // Check performance metrics
    const perfMetrics = performanceMonitor.getDetailedMetrics('phi-3.5');
    expect(perfMetrics.totalRequests).toBeGreaterThan(0);
    expect(perfMetrics.successfulRequests).toBeGreaterThan(0);
  });

  test('streaming response with UI updates', async ({ page }) => {
    // Navigate to streaming test page
    await page.goto('http://localhost:3000/streaming-test');

    // Type prompt into input
    await page.fill('[data-testid="prompt-input"]', 'Explain quantum computing');
    await page.click('[data-testid="submit-button"]');

    // Wait for streaming to start
    await expect(page.locator('.streaming-indicator')).toBeVisible();

    // Verify chunks are being received
    const responseText = await page.locator('.response-content').textContent();
    expect(responseText?.length).toBeGreaterThan(0);

    // Wait for streaming to complete
    await expect(page.locator('.streaming-indicator')).not.toBeVisible();

    // Verify final response
    const finalText = await page.locator('.response-content').textContent();
    expect(finalText?.length).toBeGreaterThan(responseText?.length || 0);
  });

  test('error handling and fallback behavior', async ({ page }) => {
    // Force an error by exceeding context length
    const longPrompt = 'test '.repeat(50000);
    
    // Attempt to generate response
    const response = await generateResponse(longPrompt);
    
    // Verify fallback model was used
    expect(response.text).toBeTruthy();
    
    // Check error was logged
    const metrics = analytics.getMetrics('phi-3.5');
    expect(metrics.errorRate).toBeGreaterThan(0);
  });

  test('rate limiting behavior', async ({ page }) => {
    // Make multiple rapid requests
    const promises = Array(20).fill(null).map(() => 
      generateResponse('Quick test prompt')
    );

    // Verify some requests were rate limited
    const results = await Promise.allSettled(promises);
    const rateLimited = results.filter(r => r.status === 'rejected');
    expect(rateLimited.length).toBeGreaterThan(0);
  });

  test('model performance under load', async ({ page }) => {
    const startTime = Date.now();
    const requests = 10;
    const prompt = 'Generate a short story about AI';

    // Make concurrent requests
    const promises = Array(requests).fill(null).map(() => 
      generateResponse(prompt)
    );

    // Wait for all requests to complete
    const results = await Promise.all(promises);
    const endTime = Date.now();

    // Verify performance metrics
    const metrics = performanceMonitor.getDetailedMetrics('phi-3.5');
    expect(metrics.avgTokensPerSecond).toBeGreaterThan(0);
    expect(metrics.p90Latency).toBeLessThan(5000); // Should respond within 5s
    expect(endTime - startTime).toBeLessThan(30000); // Total time under 30s
  });
});
