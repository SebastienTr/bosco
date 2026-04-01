'use client';

import { useEffect } from 'react';
import { isNative } from '@/lib/platform';

export default function NativeDeepLinkListener() {
  useEffect(() => {
    if (!isNative) return;
    import('@/lib/native/deep-link-handler').then(
      ({ initDeepLinkListener }) => {
        initDeepLinkListener();
      }
    );
  }, []);

  return null;
}
