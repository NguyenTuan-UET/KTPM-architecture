// -----------------[CUSTOM CIRCULT BREAKER]-------------------]

let failureCount = 0;
let state = 'CLOSED';
let openedAt = null; // Thời điểm chuyển sang OPEN

const FAILURE_THRESHOLD = 3;
const RESET_TIMEOUT = 30000;
const RESPONSE_TIMEOUT = 5000;

export const getCircuitState = () => ({ state, openedAt, RESET_TIMEOUT });

export const circuitBreaker = async (action) => {
  // Kiểm tra trạng thái OPEN và thời gian đã trôi qua
  if (state === 'OPEN') {
    const timeElapsed = Date.now() - openedAt; // Thời gian đã trôi qua kể từ khi OPEN
    if (timeElapsed >= RESET_TIMEOUT) {
      // Nếu đã đủ thời gian, chuyển sang HALF_OPEN
      state = 'HALF_OPEN';
      failureCount = 0;
      openedAt = null;
      console.warn('Circuit breaker transitioned to HALF_OPEN state.');
    } else {
      // Nếu chưa đủ thời gian, từ chối request mà không reset thời gian đếm ngược
      console.warn('⚠️⚠️⚠️ Circuit breaker is OPEN. Rejecting request.');
      throw new Error('Circuit breaker is OPEN');
    }
  }

  try {
    const result = await Promise.race([
      action(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Action timed out')), RESPONSE_TIMEOUT)
      ),
    ]);

    // Nếu thành công, reset trạng thái nếu đang ở HALF_OPEN
    if (state === 'HALF_OPEN') {
      state = 'CLOSED';
      failureCount = 0;
      openedAt = null;
      console.warn('Circuit breaker transitioned to CLOSED state.');
    }

    return result;

  } catch (error) {
    failureCount++;
    console.error('➡️ Action failed or timed out. Failure count:', failureCount);

    // Nếu đạt ngưỡng lỗi và không phải đang ở trạng thái OPEN
    if (failureCount >= FAILURE_THRESHOLD && state !== 'OPEN') {
      state = 'OPEN';
      openedAt = Date.now(); // Lưu thời điểm OPEN
      console.warn('⚠️⚠️⚠️ Circuit breaker transitioned to OPEN state.');
    }

    throw error;
  }
};


// -----------------[ORIGINAL CIRCULT BREAKER]-------------------]
// let failureCount = 0;
// let successCount = 0;
// let state = 'CLOSED';
// const FAILURE_THRESHOLD = 3;
// const SUCCESS_THRESHOLD = 2;
// const RESET_TIMEOUT = 10000; // 10 seconds

// export const circuitBreaker = async (action) => {
//   if (state === 'OPEN') {
//     console.warn('⚠️⚠️⚠️ Circuit breaker is OPEN. Rejecting request.');
//     // throw new Error('Circuit breaker is OPEN');
//   }

//   try {
//     const result = await action();

//     if (state === 'HALF_OPEN') {
//       successCount++;
//       console.log('➡️ Success count in HALF_OPEN:', successCount);
//       if (successCount >= SUCCESS_THRESHOLD) {
//         state = 'CLOSED';
//         failureCount = 0;
//         console.log('🔄️ Circuit breaker transitioned to CLOSED state.');
//       }
//     }

//     return result;
//   } catch (error) {
//     failureCount++;
//     console.error('➡️ Action failed. Failure count:', failureCount);

//     if (failureCount >= FAILURE_THRESHOLD) {
//       state = 'OPEN';
//       console.warn('⚠️⚠️⚠️ Circuit breaker transitioned to OPEN state.');

//       setTimeout(() => {
//         state = 'HALF_OPEN';
//         successCount = 0;
//         console.warn('Circuit breaker transitioned to HALF_OPEN state.');
//       }, RESET_TIMEOUT);
//     }

//     throw error;
//   }
// };
