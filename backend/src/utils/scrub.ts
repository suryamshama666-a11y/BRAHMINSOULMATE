/**
 * Scrubs sensitive PII from objects to be sent to logs/Sentry
 */
export const scrubPII = (data: unknown): unknown => {
  if (!data || typeof data !== 'object') return data;

  const sensitiveFields = [
    'password', 'token', 'auth', 'authorization', 'secret', 
    'credit_card', 'card_number', 'cvv', 'otp', 'ssn',
    'access_token', 'refresh_token', 'api_key', 'apikey'
  ];

  const scrubbed = Array.isArray(data) ? [...data] : { ...data };

  for (const key in scrubbed) {
    if (sensitiveFields.includes(key.toLowerCase())) {
      (scrubbed as Record<string, unknown>)[key] = '[REDACTED]';
    } else if (typeof (scrubbed as Record<string, unknown>)[key] === 'object') {
      (scrubbed as Record<string, unknown>)[key] = scrubPII((scrubbed as Record<string, unknown>)[key]);
    }
  }

  return scrubbed;
};
