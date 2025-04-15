import { circuitBreaker } from './circuitBreaker';

export const fetchStatus = async (statusUrl) => {
  try {
    const response = await circuitBreaker(() => fetch(statusUrl));
    const data = await response.json();

    if (data.translate_text) {
      return data; // Return translated text and download URL for the next step
    }
    throw new Error('Status fetch failed');
  } catch (error) {
    console.error('Error fetching status:', error);
    throw error;
  }
};
