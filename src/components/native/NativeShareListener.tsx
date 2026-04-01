'use client';

import { useEffect } from 'react';
import { isNative } from '@/lib/platform';

export default function NativeShareListener() {
  useEffect(() => {
    if (!isNative) return;
    import('@/lib/native/share-intent-handler').then(
      ({ initShareIntentListener }) => {
        initShareIntentListener();
      }
    );
  }, []);

  return null;
}
