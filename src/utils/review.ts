import * as StoreReview from 'expo-store-review';

export async function requestReviewIfAvailable(): Promise<void> {
  try {
    const available = await StoreReview.isAvailableAsync();
    if (available) {
      await StoreReview.requestReview();
    }
  } catch (_) {}
}
