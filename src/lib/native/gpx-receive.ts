import { registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

export interface GpxFileReceivedEvent {
  content: string;
  filename: string;
}

export interface GpxReceivePlugin {
  addListener(
    event: 'gpxFileReceived',
    listener: (data: GpxFileReceivedEvent) => void
  ): Promise<PluginListenerHandle>;
  checkIntent(): Promise<GpxFileReceivedEvent | null>;
}

const GpxReceive = registerPlugin<GpxReceivePlugin>('GpxReceive');
export default GpxReceive;
