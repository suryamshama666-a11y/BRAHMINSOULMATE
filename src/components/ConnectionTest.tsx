// Stub for ConnectionTest component
export const testConnection = async () => {
  return { connected: true, timestamp: new Date().toISOString() };
};

export default testConnection;
