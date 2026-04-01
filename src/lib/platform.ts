import { Capacitor } from '@capacitor/core';

export const isNative =
  typeof window !== 'undefined' ? Capacitor.isNativePlatform() : false;

export const platform = (
  typeof window !== 'undefined' ? Capacitor.getPlatform() : 'web'
) as 'ios' | 'android' | 'web';
