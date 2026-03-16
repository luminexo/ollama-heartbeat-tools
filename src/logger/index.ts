/**
 * Logger module for ollama-heartbeat-tools
 * Centralized logging with levels, colors, and file output
 */

import * as fs from 'fs';
import * as path from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export interface LoggerOptions {
  level?: LogLevel;
  file?: string;
  json?: boolean;
  colors?: boolean;
  timestamps?: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

const LOG_COLORS = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[37m',  // white
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
  reset: '\x1b[0m',
};

const LOG_PREFIXES = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
};

class Logger {
  private level: LogLevel = 'info';
  private filePath: string | null = null;
  private jsonMode: boolean = false;
  private useColors: boolean = true;
  private useTimestamps: boolean = false;

  /**
   * Set the current log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get the current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Set output file for logging
   */
  setFile(filePath: string): void {
    this.filePath = filePath;
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Enable JSON output mode (for CI/CD)
   */
  setJsonMode(enabled: boolean): void {
    this.jsonMode = enabled;
  }

  /**
   * Enable colored output
   */
  setColors(enabled: boolean): void {
    this.useColors = enabled;
  }

  /**
   * Enable timestamps in output
   */
  setTimestamps(enabled: boolean): void {
    this.useTimestamps = enabled;
  }

  /**
   * Configure logger with options
   */
  configure(options: LoggerOptions): void {
    if (options.level) this.level = options.level;
    if (options.file) this.filePath = options.file;
    if (options.json !== undefined) this.jsonMode = options.json;
    if (options.colors !== undefined) this.useColors = options.colors;
    if (options.timestamps !== undefined) this.useTimestamps = options.timestamps;
  }

  /**
   * Get current timestamp string
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format message for output
   */
  private formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const timestamp = this.useTimestamps ? `[${this.getTimestamp()}] ` : '';
    
    if (this.jsonMode) {
      return JSON.stringify({
        timestamp: this.getTimestamp(),
        level,
        message,
        ...(meta || {}),
      });
    }

    // Silent level doesn't have prefix/color
    const prefix = level === 'silent' ? '' : LOG_PREFIXES[level];
    const color = (this.useColors && level !== 'silent') ? LOG_COLORS[level] : '';
    const reset = this.useColors ? LOG_COLORS.reset : '';
    
    let output = `${timestamp}${color}${prefix} ${message}${reset}`;
    
    if (meta && Object.keys(meta).length > 0) {
      output += '\n' + JSON.stringify(meta, null, 2);
    }
    
    return output;
  }

  /**
   * Write to file if configured
   */
  private writeToFile(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (!this.filePath) return;
    
    const logEntry = this.jsonMode
      ? JSON.stringify({
          timestamp: this.getTimestamp(),
          level,
          message,
          ...(meta || {}),
        }) + '\n'
      : `[${this.getTimestamp()}] [${level.toUpperCase()}] ${message}${meta ? ' ' + JSON.stringify(meta) : ''}\n`;
    
    fs.appendFileSync(this.filePath, logEntry);
  }

  /**
   * Check if level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  /**
   * Log debug message (verbose output)
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return;
    console.log(this.formatMessage('debug', message, meta));
    this.writeToFile('debug', message, meta);
  }

  /**
   * Log info message (normal output)
   */
  info(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return;
    console.log(this.formatMessage('info', message, meta));
    this.writeToFile('info', message, meta);
  }

  /**
   * Log warning message
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, meta));
    this.writeToFile('warn', message, meta);
  }

  /**
   * Log error message
   */
  error(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) return;
    console.error(this.formatMessage('error', message, meta));
    this.writeToFile('error', message, meta);
  }

  /**
   * Log success message (alias for info with checkmark)
   */
  success(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return;
    const successMsg = this.useColors
      ? `\x1b[32m✓ ${message}\x1b[0m`
      : `✓ ${message}`;
    console.log(successMsg);
    this.writeToFile('info', message, meta);
  }

  /**
   * Log progress message (with spinner prefix)
   */
  progress(message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return;
    const progressMsg = this.useColors
      ? `\x1b[34m⟳ ${message}\x1b[0m`
      : `⟳ ${message}`;
    console.log(progressMsg);
    this.writeToFile('info', message, meta);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for testing
export { Logger };

// Export convenience functions
export const setLevel = (level: LogLevel) => logger.setLevel(level);
export const setFile = (filePath: string) => logger.setFile(filePath);
export const setJsonMode = (enabled: boolean) => logger.setJsonMode(enabled);
export const setColors = (enabled: boolean) => logger.setColors(enabled);
export const setTimestamps = (enabled: boolean) => logger.setTimestamps(enabled);
export const configure = (options: LoggerOptions) => logger.configure(options);
export const debug = (message: string, meta?: Record<string, unknown>) => logger.debug(message, meta);
export const info = (message: string, meta?: Record<string, unknown>) => logger.info(message, meta);
export const warn = (message: string, meta?: Record<string, unknown>) => logger.warn(message, meta);
export const error = (message: string, meta?: Record<string, unknown>) => logger.error(message, meta);
export const success = (message: string, meta?: Record<string, unknown>) => logger.success(message, meta);
export const progress = (message: string, meta?: Record<string, unknown>) => logger.progress(message, meta);