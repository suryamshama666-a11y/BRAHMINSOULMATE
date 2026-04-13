/**
 * Transaction recovery system for handling interrupted operations
 * Saves transaction state and retries on app restart
 */

import { logger } from './logger';

interface PendingTransaction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  attempts: number;
  maxAttempts: number;
}

export class TransactionRecovery {
  private static STORAGE_KEY = 'pending_transactions';
  private static MAX_ATTEMPTS = 3;
  private static MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Save a transaction for later recovery
   */
  static saveTransaction(type: string, data: any, maxAttempts = 3): string {
    const transactions = this.getPendingTransactions();
    
    const transaction: PendingTransaction = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts
    };
    
    transactions.push(transaction);
    this.savePendingTransactions(transactions);
    
    logger.info('Transaction saved for recovery:', { id: transaction.id, type });
    return transaction.id;
  }

  /**
   * Resume all pending transactions
   */
  static async resumePendingTransactions(): Promise<void> {
    const transactions = this.getPendingTransactions();
    
    if (transactions.length === 0) {
      return;
    }
    
    logger.info(`Resuming ${transactions.length} pending transactions`);
    
    for (const tx of transactions) {
      // Skip if too old
      if (Date.now() - tx.timestamp > this.MAX_AGE_MS) {
        logger.warn('Transaction too old, removing:', tx.id);
        this.removeTransaction(tx.id);
        continue;
      }
      
      // Skip if max attempts reached
      if (tx.attempts >= tx.maxAttempts) {
        logger.warn('Transaction max attempts reached:', tx.id);
        this.removeTransaction(tx.id);
        continue;
      }
      
      try {
        await this.retryTransaction(tx);
        this.removeTransaction(tx.id);
        logger.info('Transaction recovered successfully:', tx.id);
      } catch (error) {
        logger.error('Transaction recovery failed:', { id: tx.id, error });
        tx.attempts++;
        this.updateTransaction(tx);
      }
    }
  }

  /**
   * Retry a specific transaction
   */
  private static async retryTransaction(tx: PendingTransaction): Promise<void> {
    switch (tx.type) {
      case 'payment':
        // Retry payment
        await this.retryPayment(tx.data);
        break;
      case 'profile_update':
        // Retry profile update
        await this.retryProfileUpdate(tx.data);
        break;
      case 'message_send':
        // Retry message send
        await this.retryMessageSend(tx.data);
        break;
      default:
        logger.warn('Unknown transaction type:', tx.type);
    }
  }

  /**
   * Retry payment transaction
   */
  private static async retryPayment(data: any): Promise<void> {
    // Import dynamically to avoid circular dependencies
    const { api } = await import('@/lib/api');
    // Implement payment retry logic
    logger.info('Retrying payment:', data);
  }

  /**
   * Retry profile update
   */
  private static async retryProfileUpdate(data: any): Promise<void> {
    const { api } = await import('@/lib/api');
    await api.updateProfile(data.userId, data.updates);
  }

  /**
   * Retry message send
   */
  private static async retryMessageSend(data: any): Promise<void> {
    const { api } = await import('@/lib/api');
    await api.sendMessage(data);
  }

  /**
   * Remove a transaction
   */
  static removeTransaction(id: string): void {
    const transactions = this.getPendingTransactions();
    const filtered = transactions.filter(tx => tx.id !== id);
    this.savePendingTransactions(filtered);
  }

  /**
   * Update a transaction
   */
  private static updateTransaction(transaction: PendingTransaction): void {
    const transactions = this.getPendingTransactions();
    const index = transactions.findIndex(tx => tx.id === transaction.id);
    
    if (index !== -1) {
      transactions[index] = transaction;
      this.savePendingTransactions(transactions);
    }
  }

  /**
   * Get all pending transactions
   */
  private static getPendingTransactions(): PendingTransaction[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('Error reading pending transactions:', error);
      return [];
    }
  }

  /**
   * Save pending transactions
   */
  private static savePendingTransactions(transactions: PendingTransaction[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      logger.error('Error saving pending transactions:', error);
    }
  }

  /**
   * Clear all pending transactions
   */
  static clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    logger.info('All pending transactions cleared');
  }

  /**
   * Get transaction count
   */
  static getPendingCount(): number {
    return this.getPendingTransactions().length;
  }
}

export default TransactionRecovery;
