import { supabase } from '@/lib/supabase';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'log';

const logToDatabase = async (message: string, stack?: string, context: any = {}) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    await (supabase.from('client_errors' as any) as any).insert({
      user_id: session?.user?.id || null,
      message,
      stack,
      context
    });
  } catch (err) {
    // Avoid infinite loop if logging fails
    console.warn('Logging to database failed:', err);
  }
};

const log = (level: LogLevel, ...args: any[]) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  if (level === 'error') {
    const errorMsg = args.length > 0 ? (args[0] instanceof Error ? args[0].message : String(args[0])) : 'Unknown error';
    const stack = args.length > 0 && args[0] instanceof Error ? args[0].stack : undefined;
    logToDatabase(errorMsg, stack, { extra: args.slice(1) });
  }

  switch (level) {
    case 'error': console.error(prefix, ...args); break;
    case 'warn': console.warn(prefix, ...args); break;
    case 'debug': if (import.meta.env.DEV) console.debug(prefix, ...args); break;
    default: console.log(prefix, ...args);
  }
};

export const logger = {
  debug: (...args: any[]) => log('debug', ...args),
  info: (...args: any[]) => log('info', ...args),
  warn: (...args: any[]) => log('warn', ...args),
  error: (...args: any[]) => log('error', ...args),
  log: (...args: any[]) => log('log', ...args),
};

export default logger;
