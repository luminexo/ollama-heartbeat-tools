/**
 * Webhook notification system for heartbeat
 * Supports Slack, Discord, and Telegram
 */

import https from 'https';
import http from 'http';

export type WebhookProvider = 'slack' | 'discord' | 'telegram';

export interface WebhookConfig {
  provider: WebhookProvider;
  url: string;
  enabled: boolean;
  events?: string[];
}

export interface WebhookMessage {
  text: string;
  username?: string;
  icon_emoji?: string;
  attachments?: Array<{
    color?: string;
    title?: string;
    text?: string;
    fields?: Array<{
      title: string;
      value: string;
      short?: boolean;
    }>;
  }>;
}

export class WebhookClient {
  private config: WebhookConfig;

  constructor(config: WebhookConfig) {
    this.config = config;
  }

  /**
   * Send a message to the configured webhook
   */
  async send(message: string | WebhookMessage): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    try {
      const payload = this.formatPayload(message);
      return await this.post(payload);
    } catch (error) {
      console.error(`Failed to send webhook to ${this.config.provider}:`, error);
      return false;
    }
  }

  /**
   * Send a test message
   */
  async sendTest(): Promise<boolean> {
    const testMessage: WebhookMessage = {
      text: '📢 Webhook test from heartbeat-cli',
      username: 'Heartbeat Bot',
    };
    return this.send(testMessage);
  }

  /**
   * Format message for the specific provider
   */
  private formatPayload(message: string | WebhookMessage): object {
    const text = typeof message === 'string' ? message : message.text;

    switch (this.config.provider) {
      case 'slack':
        return this.formatSlackPayload(text, typeof message === 'object' ? message : undefined);
      case 'discord':
        return this.formatDiscordPayload(text, typeof message === 'object' ? message : undefined);
      case 'telegram':
        return this.formatTelegramPayload(text);
      default:
        return { text };
    }
  }

  /**
   * Format payload for Slack
   */
  private formatSlackPayload(text: string, message?: WebhookMessage): object {
    const payload: any = {
      text,
      username: message?.username || 'Heartbeat Bot',
    };

    if (message?.icon_emoji) {
      payload.icon_emoji = message.icon_emoji;
    }

    if (message?.attachments) {
      payload.attachments = message.attachments;
    }

    return payload;
  }

  /**
   * Format payload for Discord
   */
  private formatDiscordPayload(text: string, message?: WebhookMessage): object {
    const payload: any = {
      content: text,
      username: message?.username || 'Heartbeat Bot',
    };

    if (message?.attachments && message.attachments.length > 0) {
      const attachment = message.attachments[0];
      payload.embeds = [{
        title: attachment.title,
        description: attachment.text,
        color: this.parseColor(attachment.color),
        fields: attachment.fields?.map(field => ({
          name: field.title,
          value: field.value,
          inline: field.short,
        })),
      }];
    }

    return payload;
  }

  /**
   * Format payload for Telegram
   */
  private formatTelegramPayload(text: string): object {
    // Extract chat ID from URL if present
    const chatId = this.extractTelegramChatId();
    
    return {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
    };
  }

  /**
   * Parse color string to integer
   */
  private parseColor(color?: string): number {
    if (!color) return 0;
    
    const colorMap: Record<string, number> = {
      'good': 0x00ff00,
      'warning': 0xffff00,
      'danger': 0xff0000,
      'info': 0x3498db,
      'success': 0x28a745,
      'error': 0xdc3545,
    };

    if (colorMap[color]) {
      return colorMap[color];
    }

    // Try to parse hex color
    if (color.startsWith('#')) {
      return parseInt(color.replace('#', ''), 16);
    }

    return 0;
  }

  /**
   * Extract Telegram chat ID from URL
   */
  private extractTelegramChatId(): string | number {
    // URL format: https://api.telegram.org/bot<TOKEN>/sendMessage
    // Or: https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>
    const match = this.config.url.match(/chat_id=([^&]+)/);
    if (match) {
      const id = match[1];
      // Check if it's a number
      const num = parseInt(id, 10);
      return isNaN(num) ? id : num;
    }
    // Default - user needs to provide chat_id in the URL
    return '';
  }

  /**
   * POST payload to webhook URL
   */
  private post(payload: object): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const url = new URL(this.config.url);
      const postData = JSON.stringify(payload);

      const options: http.RequestOptions = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const request = (url.protocol === 'https:' ? https : http).request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(true);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        });
      });

      request.on('error', (error) => {
        reject(error);
      });

      request.write(postData);
      request.end();
    });
  }
}

/**
 * Webhook manager for handling multiple webhooks
 */
export class WebhookManager {
  private webhooks: Map<string, WebhookClient> = new Map();

  /**
   * Add a webhook configuration
   */
  add(name: string, config: WebhookConfig): void {
    this.webhooks.set(name, new WebhookClient(config));
  }

  /**
   * Remove a webhook
   */
  remove(name: string): boolean {
    return this.webhooks.delete(name);
  }

  /**
   * Get all webhook names
   */
  list(): string[] {
    return Array.from(this.webhooks.keys());
  }

  /**
   * Send message to all enabled webhooks
   */
  async broadcast(message: string | WebhookMessage): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [name, client] of this.webhooks) {
      results[name] = await client.send(message);
    }

    return results;
  }

  /**
   * Send message to a specific webhook
   */
  async sendTo(name: string, message: string | WebhookMessage): Promise<boolean> {
    const client = this.webhooks.get(name);
    if (!client) {
      throw new Error(`Webhook "${name}" not found`);
    }
    return client.send(message);
  }

  /**
   * Send test message to a specific webhook
   */
  async test(name: string): Promise<boolean> {
    const client = this.webhooks.get(name);
    if (!client) {
      throw new Error(`Webhook "${name}" not found`);
    }
    return client.sendTest();
  }
}
