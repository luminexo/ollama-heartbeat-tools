/**
 * Tests for webhook notification system
 */

import { WebhookClient, WebhookManager } from '../webhooks';

describe('WebhookClient', () => {
  const mockConfig = {
    provider: 'slack' as const,
    url: 'https://hooks.slack.com/services/T123/B456/xyz',
    enabled: true,
  };

  describe('constructor', () => {
    it('should create a webhook client', () => {
      const client = new WebhookClient(mockConfig);
      expect(client).toBeDefined();
    });
  });

  describe('send', () => {
    it('should return false when disabled', async () => {
      const disabledConfig = { ...mockConfig, enabled: false };
      const client = new WebhookClient(disabledConfig);
      const result = await client.send('Test message');
      
      expect(result).toBe(false);
    });
  });

  describe('sendTest', () => {
    it('should return false when disabled', async () => {
      const disabledConfig = { ...mockConfig, enabled: false };
      const client = new WebhookClient(disabledConfig);
      const result = await client.sendTest();
      
      expect(result).toBe(false);
    });
  });
});

describe('WebhookManager', () => {
  it('should add multiple webhooks', () => {
    const manager = new WebhookManager();
    
    manager.add('slack', {
      provider: 'slack',
      url: 'https://hooks.slack.com/services/123',
      enabled: true,
    });
    
    manager.add('discord', {
      provider: 'discord',
      url: 'https://discord.com/api/webhooks/456',
      enabled: true,
    });

    expect(manager.list()).toHaveLength(2);
    expect(manager.list()).toContain('slack');
    expect(manager.list()).toContain('discord');
  });

  it('should remove a webhook', () => {
    const manager = new WebhookManager();
    
    manager.add('slack', {
      provider: 'slack',
      url: 'https://hooks.slack.com/services/123',
      enabled: true,
    });

    const removed = manager.remove('slack');
    expect(removed).toBe(true);
    expect(manager.list()).toHaveLength(0);
  });

  it('should list webhooks', () => {
    const manager = new WebhookManager();
    
    manager.add('slack', {
      provider: 'slack',
      url: 'https://hooks.slack.com/services/123',
      enabled: true,
    });

    const list = manager.list();
    expect(list).toEqual(['slack']);
  });

  it('should throw error when sending to non-existent webhook', async () => {
    const manager = new WebhookManager();
    
    await expect(manager.sendTo('nonexistent', 'test')).rejects.toThrow('Webhook "nonexistent" not found');
  });

  it('should throw error when testing non-existent webhook', async () => {
    const manager = new WebhookManager();
    
    await expect(manager.test('nonexistent')).rejects.toThrow('Webhook "nonexistent" not found');
  });
});
