// Lock management service for handling temporary and permanent user locks
export interface UserLock {
  userId: number;
  lockType: 'TEMPORARY' | 'PERMANENT';
  reason: string;
  lockedAt: string;
  lockExpiresAt?: string; // Only for temporary locks
  lockedByAdminId: number;
}

export interface TempLockRequest {
  userId: number;
  duration: number; // Duration in days (7-30)
  reason: string;
  adminId: number;
}

export interface PermanentLockRequest {
  userId: number;
  reason: string;
  adminId: number;
}

class UserLockService {
  private storageKey = 'user_locks';
  
  // Get all locks from localStorage
  private getLocks(): UserLock[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }
  
  // Save locks to localStorage
  private saveLocks(locks: UserLock[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(locks));
  }
  
  // Add temporary lock
  addTemporaryLock(request: TempLockRequest): void {
    const locks = this.getLocks();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + request.duration * 24 * 60 * 60 * 1000);
    
    const newLock: UserLock = {
      userId: request.userId,
      lockType: 'TEMPORARY',
      reason: request.reason,
      lockedAt: now.toISOString(),
      lockExpiresAt: expiresAt.toISOString(),
      lockedByAdminId: request.adminId
    };
    
    // Remove existing lock for this user if any
    const filteredLocks = locks.filter(lock => lock.userId !== request.userId);
    filteredLocks.push(newLock);
    
    this.saveLocks(filteredLocks);
    console.log(`🔒 Added temporary lock for user ${request.userId} until ${expiresAt.toLocaleString()}`);
  }
  
  // Add permanent lock
  addPermanentLock(request: PermanentLockRequest): void {
    const locks = this.getLocks();
    const now = new Date();
    
    const newLock: UserLock = {
      userId: request.userId,
      lockType: 'PERMANENT',
      reason: request.reason,
      lockedAt: now.toISOString(),
      lockedByAdminId: request.adminId
    };
    
    // Remove existing lock for this user if any
    const filteredLocks = locks.filter(lock => lock.userId !== request.userId);
    filteredLocks.push(newLock);
    
    this.saveLocks(filteredLocks);
    console.log(`🔒 Added permanent lock for user ${request.userId}`);
  }
  
  // Remove lock (unlock user)
  removeLock(userId: number): void {
    const locks = this.getLocks();
    const filteredLocks = locks.filter(lock => lock.userId !== userId);
    this.saveLocks(filteredLocks);
    console.log(`🔓 Removed lock for user ${userId}`);
  }
  
  // Get lock for specific user
  getUserLock(userId: number): UserLock | null {
    const locks = this.getLocks();
    return locks.find(lock => lock.userId === userId) || null;
  }
  
  // Check if user is locked
  isUserLocked(userId: number): boolean {
    const lock = this.getUserLock(userId);
    if (!lock) return false;
    
    // Check if temporary lock has expired
    if (lock.lockType === 'TEMPORARY' && lock.lockExpiresAt) {
      const now = new Date();
      const expiresAt = new Date(lock.lockExpiresAt);
      if (now > expiresAt) {
        // Lock has expired, remove it
        this.removeLock(userId);
        return false;
      }
    }
    
    return true;
  }
  
  // Get expired temporary locks
  getExpiredLocks(): UserLock[] {
    const locks = this.getLocks();
    const now = new Date();
    
    return locks.filter(lock => {
      if (lock.lockType === 'TEMPORARY' && lock.lockExpiresAt) {
        const expiresAt = new Date(lock.lockExpiresAt);
        return now > expiresAt;
      }
      return false;
    });
  }
  
  // Auto-unlock expired temporary locks
  autoUnlockExpired(): number {
    const expiredLocks = this.getExpiredLocks();
    let unlockedCount = 0;
    
    expiredLocks.forEach(lock => {
      this.removeLock(lock.userId);
      unlockedCount++;
      console.log(`🔓 Auto-unlocked user ${lock.userId} (temporary lock expired)`);
    });
    
    return unlockedCount;
  }
  
  // Get all active locks with user info
  getAllActiveLocks(): UserLock[] {
    const locks = this.getLocks();
    const now = new Date();
    
    return locks.filter(lock => {
      if (lock.lockType === 'TEMPORARY' && lock.lockExpiresAt) {
        const expiresAt = new Date(lock.lockExpiresAt);
        return now <= expiresAt;
      }
      return lock.lockType === 'PERMANENT';
    });
  }
  
  // Get lock statistics
  getLockStats(): { total: number; temporary: number; permanent: number; expiring24h: number } {
    const activeLocks = this.getAllActiveLocks();
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const stats = {
      total: activeLocks.length,
      temporary: activeLocks.filter(lock => lock.lockType === 'TEMPORARY').length,
      permanent: activeLocks.filter(lock => lock.lockType === 'PERMANENT').length,
      expiring24h: activeLocks.filter(lock => {
        if (lock.lockType === 'TEMPORARY' && lock.lockExpiresAt) {
          const expiresAt = new Date(lock.lockExpiresAt);
          return expiresAt <= in24h && expiresAt > now;
        }
        return false;
      }).length
    };
    
    return stats;
  }
}

export const userLockService = new UserLockService();