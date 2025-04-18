let failureCount = 0;
let successCount = 0;
let state = 'CLOSED';
const FAILURE_THRESHOLD = 3;
const SUCCESS_THRESHOLD = 2;
const RESET_TIMEOUT = 10000; // 10 seconds

export const circuitBreaker = async (action) => {
  if (state === 'OPEN') {
    console.warn('⚠️⚠️⚠️ Circuit breaker is OPEN. Rejecting request.');
    // throw new Error('Circuit breaker is OPEN');
  }

  try {
    const result = await action();

    if (state === 'HALF_OPEN') {
      successCount++;
      console.log('➡️ Success count in HALF_OPEN:', successCount);
      if (successCount >= SUCCESS_THRESHOLD) {
        state = 'CLOSED';
        failureCount = 0;
        console.log('🔄️ Circuit breaker transitioned to CLOSED state.');
      }
    }

    return result;
  } catch (error) {
    failureCount++;
    console.error('➡️ Action failed. Failure count:', failureCount);

    if (failureCount >= FAILURE_THRESHOLD) {
      state = 'OPEN';
      console.warn('⚠️⚠️⚠️ Circuit breaker transitioned to OPEN state.');

      setTimeout(() => {
        state = 'HALF_OPEN';
        successCount = 0;
        console.warn('Circuit breaker transitioned to HALF_OPEN state.');
      }, RESET_TIMEOUT);
    }

    throw error;
  }
};
