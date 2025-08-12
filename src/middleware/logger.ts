import { existsSync, mkdirSync, appendFileSync } from "fs";
import { join } from "path";
import type { Context } from "hono";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
}

interface RequestContext {
  requestId: string;
  ip: string;
  userAgent: string;
  method: string;
  url: string;
  startTime: number;
}

class Logger {
  private logsDir: string;

  constructor() {
    this.logsDir = join(process.cwd(), "logs");
    this.ensureLogsDirectory();
  }

  // Extract request context from Hono context
  private getRequestContext(c: Context): RequestContext {
    const existing = c.get("requestContext");
    if (existing) return existing;

    const requestContext: RequestContext = {
      requestId: crypto.randomUUID(),
      ip:
        c.req.header("x-forwarded-for") ||
        c.req.header("x-real-ip") ||
        "unknown",
      userAgent: c.req.header("user-agent") || "unknown",
      method: c.req.method,
      url: c.req.url,
      startTime: Date.now(),
    };

    c.set("requestContext", requestContext);
    return requestContext;
  }

  private ensureLogsDirectory() {
    if (!existsSync(this.logsDir)) {
      mkdirSync(this.logsDir, { recursive: true });
    }
  }

  private formatLog(entry: LogEntry): string {
    const logData = {
      ...entry,
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(logData) + "\n";
  }

  private writeToFile(level: LogLevel, content: string) {
    const today = new Date().toISOString().split("T")[0];
    const filename = `${today}-${level}.log`;
    const filepath = join(this.logsDir, filename);

    try {
      appendFileSync(filepath, content);
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }

  private log(
    level: LogLevel,
    message: string,
    data?: any,
    meta?: Partial<LogEntry>
  ) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      ...meta,
    };

    // Console output with colors
    const colors = {
      info: "\x1b[36m", // Cyan
      warn: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
      debug: "\x1b[35m", // Magenta
    };
    const reset = "\x1b[0m";

    const formattedMessage = `${colors[level]}[${entry.timestamp}] ${level.toUpperCase()}: ${message}${reset}`;
    console.log(formattedMessage, data ? data : "");

    // Write to file
    this.writeToFile(level, this.formatLog(entry));

    // Also write to combined log
    this.writeToFile("info" as LogLevel, this.formatLog(entry));
  }

  // Context-aware logging methods
  info(message: string, data?: any, context?: Context | Partial<LogEntry>) {
    const meta =
      context && typeof context === "object" && "req" in context
        ? this.getRequestContext(context)
        : context;
    this.log("info", message, data, meta);
  }

  warn(message: string, data?: any, context?: Context | Partial<LogEntry>) {
    const meta =
      context && typeof context === "object" && "req" in context
        ? this.getRequestContext(context)
        : context;
    this.log("warn", message, data, meta);
  }

  error(message: string, data?: any, context?: Context | Partial<LogEntry>) {
    const meta =
      context && typeof context === "object" && "req" in context
        ? this.getRequestContext(context)
        : context;
    this.log("error", message, data, meta);
  }

  debug(message: string, data?: any, context?: Context | Partial<LogEntry>) {
    if (process.env.NODE_ENV === "development") {
      const meta =
        context && typeof context === "object" && "req" in context
          ? this.getRequestContext(context)
          : context;
      this.log("debug", message, data, meta);
    }
  }

  // Auto-track HTTP requests
  requestFromContext(c: Context, statusCode: number) {
    const ctx = this.getRequestContext(c);
    const responseTime = Date.now() - ctx.startTime;

    this.request(ctx.method, ctx.url, statusCode, responseTime, {
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      requestId: ctx.requestId,
    });
  }

  // HTTP request logger
  request(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    meta?: {
      ip?: string;
      userAgent?: string;
      requestId?: string;
    }
  ) {
    const level: LogLevel =
      statusCode >= 400 ? "error" : statusCode >= 300 ? "warn" : "info";
    const message = `${method} ${url} - ${statusCode} - ${responseTime}ms`;

    this.log(
      level,
      message,
      {
        method,
        url,
        statusCode,
        responseTime,
      },
      meta
    );
  }
}

// Export singleton instance
export const logger = new Logger();

// Backward compatibility
export const customLogger = (message: string, ...rest: string[]) => {
  logger.info(message, rest.length > 0 ? rest : undefined);
};
