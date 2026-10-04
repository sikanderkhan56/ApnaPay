import { DEMO } from '@/config/demo';

export function wait(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function simulateNetwork(): Promise<void> {
  const span = DEMO.networkDelayMs.max - DEMO.networkDelayMs.min;
  const ms = DEMO.networkDelayMs.min + Math.round(Math.random() * span);
  return wait(ms);
}
