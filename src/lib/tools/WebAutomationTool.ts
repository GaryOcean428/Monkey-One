import type { Tool } from '../../types';
import puppeteer from 'puppeteer';

export class WebAutomationTool implements Tool {
  name = 'web-automation';
  description = 'Automates web interactions including form filling and data extraction';

  private async createBrowser() {
    return await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });
  }

  async execute(args: {
    action: 'login' | 'fillForm' | 'extract';
    url: string;
    data: Record<string, string>;
    selectors?: Record<string, string>;
  }): Promise<unknown> {
    const browser = await this.createBrowser();
    
    try {
      const page = await browser.newPage();
      await page.goto(args.url);

      switch (args.action) {
        case 'login':
          await this.handleLogin(page, args.data);
          break;
        case 'fillForm':
          await this.fillForm(page, args.data, args.selectors || {});
          break;
        case 'extract':
          return await this.extractData(page, args.selectors || {});
      }

      return { success: true };
    } finally {
      await browser.close();
    }
  }

  private async handleLogin(
    page: puppeteer.Page,
    credentials: Record<string, string>
  ) {
    await page.type('input[type="email"], input[name="email"], input[name="username"]', credentials.username);
    await page.type('input[type="password"]', credentials.password);
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForNavigation();
  }

  private async fillForm(
    page: puppeteer.Page,
    data: Record<string, string>,
    selectors: Record<string, string>
  ) {
    for (const [field, value] of Object.entries(data)) {
      const selector = selectors[field] || `input[name="${field}"]`;
      await page.type(selector, value);
    }
  }

  private async extractData(
    page: puppeteer.Page,
    selectors: Record<string, string>
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    
    for (const [key, selector] of Object.entries(selectors)) {
      result[key] = await page.$eval(selector, el => el.textContent || '');
    }
    
    return result;
  }
}