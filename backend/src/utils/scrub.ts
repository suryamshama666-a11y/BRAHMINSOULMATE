/**
 * Scrubs sensitive PII from objects to be sent to logs/Sentry
 */
export const scrubPII = (data: any): any => {
  if (!data || typeof data !== 'object') return data;

  const sensitiveFields = [
    'password', 'token', 'auth', 'authorization', 'secret', 
    'credit_card', 'card_number', 'cvv', 'otp', 'ssn',
    'access_token', 'refresh_token', 'api_key', 'apikey'
  ];

  const scrubbed = Array.isArray(data) ? [...data] : { ...data };

  for (const key in scrubbed) {
    if (sensitiveFields.includes(key.toLowerCase())) {
      scrubbed[key] = '[REDACTED]';
    } else if (typeof scrubbed[key] === 'object') {
      scrubbed[key] = scrubPII(scrubbed[key]);
    }
  }

  return scrubbed;
};
