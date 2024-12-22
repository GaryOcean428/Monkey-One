import { BaseAgent } from '../base';
import type { Message, FormTask } from '@/types';
import puppeteer from 'puppeteer';

export class FormFillerAgent extends BaseAgent {
  constructor(id: string, name: string) {
    super(id, name, 'form_filler', [
      'form_automation',
      'data_input',
      'validation'
    ]);
  }

  async processTask(task: FormTask): Promise<any> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.goto(task.url, { waitUntil: 'networkidle0' });

      // Handle login if required
      if (task.requiresAuth) {
        await this.handleAuthentication(page, task.credentials);
      }

      // Fill form fields
      for (const [selector, value] of Object.entries(task.fields)) {
        await page.type(selector, value);
      }

      // Submit form
      if (task.submitSelector) {
        await page.click(task.submitSelector);
        await page.waitForNavigation();
      }

      // Verify submission
      const success = await this.verifySubmission(page, task.successIndicator);
      return { success, url: page.url() };
    } finally {
      await browser.close();
    }
  }

  private async handleAuthentication(page: any, credentials: any): Promise<void> {
    await page.type(credentials.usernameSelector, credentials.username);
    await page.type(credentials.passwordSelector, credentials.password);
    await page.click(credentials.submitSelector);
    await page.waitForNavigation();
  }

  private async verifySubmission(page: any, indicator: string): Promise<boolean> {
    try {
      await page.waitForSelector(indicator, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      const task = await this.parseFormTask(message.content);
      const result = await this.processTask(task);
      
      return this.createResponse(
        result.success 
          ? 'Successfully submitted the form.'
          : 'Form submission failed. Please check the form configuration.'
      );
    } catch (error) {
      console.error('Error in FormFillerAgent:', error);
      return this.createResponse(
        'I encountered an error while filling the form. Please verify the form configuration.'
      );
    }
  }

  private async parseFormTask(content: string): Promise<FormTask> {
    // Implement task parsing logic
    return {
      id: crypto.randomUUID(),
      type: 'form_filling',
      url: '',
      fields: {},
      submitSelector: '',
      successIndicator: '',
      requiresAuth: false
    };
  }
}