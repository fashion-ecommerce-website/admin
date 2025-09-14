import { userLockService } from './userLockService';
import { userApi } from './api/userApi';

// Cron job manager for automatic user unlock
class CronJobManager {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;
  
  // Start the auto-unlock cron job
  startAutoUnlockJob(): void {
    if (this.isRunning) {
      console.log('⚡ Auto-unlock cron job is already running');
      return;
    }
    
    console.log('🚀 Starting auto-unlock cron job (runs every 10 seconds for testing)');
    
    // Run immediately
    this.runAutoUnlock();
    
    // Schedule to run every 10 seconds for testing short-duration locks
    const interval = setInterval(() => {
      this.runAutoUnlock();
    }, 10 * 1000); // 10 seconds for testing
    
    this.intervals.set('auto-unlock', interval);
    this.isRunning = true;
  }
  
  // Stop the auto-unlock cron job
  stopAutoUnlockJob(): void {
    const interval = this.intervals.get('auto-unlock');
    if (interval) {
      clearInterval(interval);
      this.intervals.delete('auto-unlock');
      this.isRunning = false;
      console.log('⏹️ Stopped auto-unlock cron job');
    }
  }
  
  // Manual trigger for auto-unlock
  async runAutoUnlock(): Promise<void> {
    try {
      console.log('🔍 Checking for expired temporary locks...');
      
      // Get expired locks before removing them from localStorage
      const expiredLocks = userLockService.getExpiredLocks();
      
      if (expiredLocks.length > 0) {
        console.log(`🔓 Found ${expiredLocks.length} expired locks, unlocking users...`);
        
        // Call API to unlock each user in the database
        for (const lock of expiredLocks) {
          try {
            const result = await userApi.toggleUserActiveStatus(lock.userId, true);
            if (result.success) {
              console.log(`✅ API unlock successful for user ${lock.userId}`);
            } else {
              console.error(`❌ API unlock failed for user ${lock.userId}:`, result.message);
              continue; // Skip removing from localStorage if API call failed
            }
          } catch (error) {
            console.error(`❌ API unlock error for user ${lock.userId}:`, error);
            continue; // Skip removing from localStorage if API call failed
          }
        }
        
        // Remove locks from localStorage only after successful API calls
        const unlockedCount = userLockService.autoUnlockExpired();
        console.log(`✅ Auto-unlocked ${unlockedCount} users with expired temporary locks`);
        
        // Trigger a refresh of user data if we're on the users page
        this.notifyUserListRefresh();
      } else {
        console.log('✅ No expired locks found');
      }
      
      // Log current lock statistics
      const stats = userLockService.getLockStats();
      if (stats.total > 0) {
        console.log(`📊 Lock Stats: ${stats.total} total (${stats.temporary} temp, ${stats.permanent} perm, ${stats.expiring24h} expiring in 24h)`);
      }
      
    } catch (error) {
      console.error('❌ Error in auto-unlock job:', error);
    }
  }
  
  // Notify components to refresh user list
  private notifyUserListRefresh(): void {
    // Dispatch custom event for user list refresh
    const event = new CustomEvent('userLockChanged', {
      detail: { action: 'auto-unlock', timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(event);
  }
  
  // Get cron job status
  getStatus(): { isRunning: boolean; activeJobs: string[]; stats: any } {
    const stats = userLockService.getLockStats();
    return {
      isRunning: this.isRunning,
      activeJobs: Array.from(this.intervals.keys()),
      stats
    };
  }
  
  // Schedule a one-time unlock for a specific time
  scheduleUnlock(userId: number, unlockTime: Date): void {
    const now = new Date();
    const delay = unlockTime.getTime() - now.getTime();
    
    if (delay <= 0) {
      console.log(`⚡ Immediate unlock for user ${userId}`);
      // Call API to unlock user immediately
      userApi.toggleUserActiveStatus(userId, true).then(result => {
        if (result.success) {
          userLockService.removeLock(userId);
          this.notifyUserListRefresh();
          console.log(`🔓 Immediate unlock successful for user ${userId}`);
        } else {
          console.error(`❌ Immediate unlock API failed for user ${userId}:`, result.message);
        }
      }).catch(error => {
        console.error(`❌ Immediate unlock API error for user ${userId}:`, error);
      });
      return;
    }
    
    console.log(`⏰ Scheduled unlock for user ${userId} at ${unlockTime.toLocaleString()}`);
    
    const timeout = setTimeout(async () => {
      try {
        // Call API to unlock user
        const result = await userApi.toggleUserActiveStatus(userId, true);
        if (result.success) {
          userLockService.removeLock(userId);
          this.notifyUserListRefresh();
          console.log(`🔓 Scheduled unlock executed successfully for user ${userId}`);
        } else {
          console.error(`❌ Scheduled unlock API failed for user ${userId}:`, result.message);
        }
      } catch (error) {
        console.error(`❌ Scheduled unlock API error for user ${userId}:`, error);
      }
    }, delay);
    
    this.intervals.set(`unlock-${userId}`, timeout as any);
  }
  
  // Cancel scheduled unlock
  cancelScheduledUnlock(userId: number): void {
    const key = `unlock-${userId}`;
    const timeout = this.intervals.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.intervals.delete(key);
      console.log(`❌ Cancelled scheduled unlock for user ${userId}`);
    }
  }
  
  // Cleanup all intervals
  cleanup(): void {
    this.intervals.forEach((interval, key) => {
      clearInterval(interval);
      console.log(`🧹 Cleaned up interval: ${key}`);
    });
    this.intervals.clear();
    this.isRunning = false;
  }
}

export const cronJobManager = new CronJobManager();

// Auto-start the cron job when the service is imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  cronJobManager.startAutoUnlockJob();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    cronJobManager.cleanup();
  });
}