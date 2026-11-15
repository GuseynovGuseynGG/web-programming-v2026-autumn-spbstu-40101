export function findMaxSubarraySum(arr, n) {
  if (!Array.isArray(arr) || arr.length === 0 || n <= 0 || n > arr.length) {
    return 0;
  }

  let windowSum = 0;
  for (let i = 0; i < n; i += 1) {
    windowSum += arr[i];
  }

  let maxSum = windowSum;
  for (let i = n; i < arr.length; i += 1) {
    windowSum += arr[i] - arr[i - n];
    if (windowSum > maxSum) {
      maxSum = windowSum;
    }
  }

  return maxSum;
}
