import { BaseAgent } from '../base';
import type { Message, ScrapingTask } from '@/types';
import puppeteer from 'puppeteer';

export class WebScraperAgent extends BaseAgent {
  constructor(id: string, name: string) {
    super(id, name, 'scraper', [
      'web_scraping',
      'data_extraction',
      'content_parsing'
    ]);
  }

  async processTask(task: ScrapingTask): Promise<any> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.goto(task.url, { waitUntil: 'networkidle0' });

      const results = {};
      for (const [key, selector] of Object.entries(task.selectors)) {
        results[key] = await page.$eval(selector, (el) => el.textContent);
      }

      return results;
    } finally {
      await browser.close();
    }
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      const task = await this.parseScrapingTask(message.content);
      const results = await this.processTask(task);
      
      return this.createResponse(
        `Successfully scraped data:\n\`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\``
      );
    } catch (error) {
      console.error('Error in WebScraperAgent:', error);
      return this.createResponse(
        'I encountered an error while scraping the website. Please check the URL and selectors.'
      );
    }
  }

  private async parseScrapingTask(content: string): Promise<ScrapingTask> {
    // Implement task parsing logic
    return {
      id: crypto.randomUUID(),
      type: 'scraping',
      url: '',
      selectors: {},
      options: {}
    };
  }
}