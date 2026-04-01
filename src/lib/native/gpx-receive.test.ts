import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @capacitor/core before importing
vi.mock('@capacitor/core', () => ({
  registerPlugin: vi.fn(() => ({
    addListener: vi.fn(() => Promise.resolve({ remove: vi.fn() })),
    checkIntent: vi.fn(() => Promise.resolve(null)),
  })),
}));

import { registerPlugin } from '@capacitor/core';
import GpxReceive from './gpx-receive';
import type { GpxReceivePlugin, GpxFileReceivedEvent } from './gpx-receive';

describe('gpx-receive', () => {
  it('registers the GpxReceive plugin via registerPlugin', () => {
    expect(registerPlugin).toHaveBeenCalledWith('GpxReceive');
  });

  it('exports the plugin instance', () => {
    expect(GpxReceive).toBeDefined();
    expect(GpxReceive.addListener).toBeDefined();
    expect(GpxReceive.checkIntent).toBeDefined();
  });

  it('addListener returns a PluginListenerHandle promise', async () => {
    const handle = await GpxReceive.addListener('gpxFileReceived', () => {});
    expect(handle).toBeDefined();
    expect(handle.remove).toBeDefined();
  });

  it('checkIntent returns a promise', async () => {
    const result = await GpxReceive.checkIntent();
    expect(result).toBeNull();
  });

  it('exports GpxFileReceivedEvent type correctly', () => {
    const event: GpxFileReceivedEvent = {
      content: '<gpx></gpx>',
      filename: 'test.gpx',
    };
    expect(event.content).toBe('<gpx></gpx>');
    expect(event.filename).toBe('test.gpx');
  });
});
