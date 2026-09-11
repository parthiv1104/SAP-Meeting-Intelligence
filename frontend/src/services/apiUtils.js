// Simulates network latency so loading/skeleton states behave realistically.
// When a Django REST backend is available, replace the body of each service
// method with a fetch()/axios call — the calling components stay unchanged.
export function mockResolve(data, delay = 300) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}
