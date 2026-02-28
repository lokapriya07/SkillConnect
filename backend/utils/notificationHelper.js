/**
 * Notification Helper Utility
 * Provides standardized functions for sending notifications to users
 * based on worker actions in the job lifecycle
 */

const Notification = require('../models/Notification');

// In-memory store for push tokens (should be database in production)
let pushTokens = [];

/**
 * Register a push token for a user
 */
function registerPushToken(userId, userType, expoPushToken) {
    // Remove existing token for same user
    pushTokens = pushTokens.filter(t => t.userId !== userId);
    
    // Add new token
    pushTokens.push({
        userId,
        userType,
        expoPushToken,
        createdAt: new Date()
    });
}

/**
 * Unregister a push token
 */
function unregisterPushToken(userId) {
    pushTokens = pushTokens.filter(t => t.userId !== userId);
}

/**
 * Get push token for a user
 */
function getPushToken(userId) {
    return pushTokens.find(t => t.userId === userId);
}

/**
 * Send notification to user
 * @param {string} userId - The user ID to send notification to
 * @param {string} title - Notification title
 * @param {string} message - Notification body message
 * @param {object} data - Additional data (type, jobId, etc.)
 * @param {string} userModel - 'User' or 'Work'
 * @param {string} relatedId - Related entity ID (jobId, etc.)
 */
async function sendNotification(userId, title, message, data = {}, userModel = 'User', relatedId = null) {
    const notificationType = data.type || 'status_update';
    const jobId = relatedId || data.jobId;
    
    // Check for duplicate notifications (idempotency)
    if (jobId && isDuplicateNotification(jobId, notificationType)) {
        console.log(`[Notification] Duplicate notification skipped: ${notificationType} for job ${jobId}`);
        return { success: false, reason: 'duplicate' };
    }
    
    // 1. Save to Database for persistence
    try {
        await Notification.create({
            userId,
            userModel,
            type: notificationType,
            title,
            message,
            relatedId: relatedId || data.jobId || null
        });
        console.log(`[Notification] Saved to DB for user ${userId}: ${title}`);
    } catch (dbError) {
        console.error('[Notification] Error saving to DB:', dbError);
        // Continue to send push even if DB save fails
    }

    // 2. Send Push Notification (if token exists)
    const userToken = pushTokens.find(t => t.userId === userId);

    if (!userToken) {
        console.log(`[Notification] No push token found for user: ${userId}`);
        return { success: false, reason: 'no_token' };
    }

    const pushMessage = {
        to: userToken.expoPushToken,
        sound: 'default',
        title,
        message,
        data: {
            ...data,
            channelId: 'job-updates'
        },
        ios: {
            sound: true,
            badge: true
        },
        android: {
            sound: true,
            priority: 'high',
            channelId: 'job-updates'
        }
    };

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pushMessage),
        });

        const result = await response.json();
        console.log('[Notification] Push sent successfully:', result);
        return { success: true };
    } catch (error) {
        console.error('[Notification] Error sending push:', error);
        return { success: false, reason: error.message };
    }
}

/**
 * Notify user when worker submits a bid on their job
 */
async function notifyBidSubmitted(job, workerName, bidAmount) {
    if (!job.userId) return;
    
    const title = "📝 New Bid Received!";
    const message = `${workerName} has placed a bid of ₹${bidAmount} on your job.`;
    
    await sendNotification(
        job.userId.toString(),
        title,
        message,
        { type: 'bid_submitted', jobId: job._id.toString() },
        'User',
        job._id
    );
}

/**
 * Notify user when worker accepts their job
 */
async function notifyJobAccepted(job, workerName, scheduledTime = null) {
    if (!job.userId) return;
    
    const serviceName = job.serviceName || 'your service';
    const timeInfo = scheduledTime ? ` for ${scheduledTime}` : '';
    
    const title = "✅ Worker Accepted Your Job!";
    const message = `${workerName} has accepted your job${timeInfo}.`;
    
    await sendNotification(
        job.userId.toString(),
        title,
        message,
        { type: 'worker_accepted', jobId: job._id.toString() },
        'User',
        job._id
    );
}

/**
 * Notify user when worker is on the way
 */
async function notifyWorkerOnTheWay(job, workerName) {
    if (!job.userId) return;
    
    const title = "🚗 Worker Is On The Way!";
    const message = `${workerName} is on the way to your location.`;
    
    await sendNotification(
        job.userId.toString(),
        title,
        message,
        { type: 'worker_on_the_way', jobId: job._id.toString() },
        'User',
        job._id
    );
}

/**
 * Notify user when worker starts the service
 */
async function notifyServiceStarted(job, workerName) {
    if (!job.userId) return;
    
    const title = "🔧 Service Started";
    const message = `${workerName} has started the service.`;
    
    await sendNotification(
        job.userId.toString(),
        title,
        message,
        { type: 'service_started', jobId: job._id.toString() },
        'User',
        job._id
    );
}

/**
 * Notify user when worker pauses the service
 */
async function notifyServicePaused(job, workerName, reason = null) {
    if (!job.userId) return;
    
    const title = "⏸️ Service Paused";
    const reasonInfo = reason ? ': ' + reason : '';
    const message = `${workerName} has paused the service${reasonInfo}.`;
    
    await sendNotification(
        job.userId.toString(),
        title,
        message,
        { type: 'service_paused', jobId: job._id.toString() },
        'User',
        job._id
    );
}

/**
 * Notify user when worker resumes the service
 */
async function notifyServiceResumed(job, workerName) {
    if (!job.userId) return;
    
    const title = "▶️ Service Resumed";
    const message = `${workerName} has resumed the service.`;
    
    await sendNotification(
        job.userId.toString(),
        title,
        message,
        { type: 'service_resumed', jobId: job._id.toString() },
        'User',
        job._id
    );
}

/**
 * Notify user when worker completes the job
 */
async function notifyJobCompleted(job, workerName) {
    if (!job.userId) return;
    
    const title = "✅ Job Completed!";
    const message = `${workerName} has completed the job. Please rate your experience.`;
    
    await sendNotification(
        job.userId.toString(),
        title,
        message,
        { type: 'job_completed', jobId: job._id.toString() },
        'User',
        job._id
    );
}

/**
 * Notify user when worker cancels the job
 */
async function notifyJobCancelled(job, workerName, reason = null) {
    if (!job.userId) return;
    
    const title = "❌ Job Cancelled";
    const reasonInfo = reason ? '\nReason: ' + reason : '';
    const message = `${workerName} has cancelled the job.${reasonInfo}`;
    
    await sendNotification(
        job.userId.toString(),
        title,
        message,
        { type: 'job_cancelled', jobId: job._id.toString() },
        'User',
        job._id
    );
}

/**
 * Check for duplicate notifications (idempotency)
 * Uses a simple in-memory cache with jobId + action type
 */
const notificationCache = new Map();
const CACHE_EXPIRY = 60000; // 1 minute

function getNotificationCacheKey(jobId, actionType) {
    return `${jobId}_${actionType}`;
}

function isDuplicateNotification(jobId, actionType) {
    const key = getNotificationCacheKey(jobId, actionType);
    const exists = notificationCache.has(key);
    
    if (!exists) {
        // Cache this notification
        notificationCache.set(key, Date.now());
        
        // Clean up old entries
        const now = Date.now();
        for (const [k, v] of notificationCache.entries()) {
            if (now - v > CACHE_EXPIRY) {
                notificationCache.delete(k);
            }
        }
    }
    
    return exists;
}

module.exports = {
    registerPushToken,
    unregisterPushToken,
    getPushToken,
    sendNotification,
    notifyBidSubmitted,
    notifyJobAccepted,
    notifyWorkerOnTheWay,
    notifyServiceStarted,
    notifyServicePaused,
    notifyServiceResumed,
    notifyJobCompleted,
    notifyJobCancelled,
    isDuplicateNotification
};
