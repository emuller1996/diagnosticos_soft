import { registerSW } from 'virtual:pwa-register';

export function registerPWA() {
  registerSW({
    immediate: true,
  });
}