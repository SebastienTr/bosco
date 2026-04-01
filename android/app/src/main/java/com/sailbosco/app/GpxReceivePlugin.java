package com.sailbosco.app;

import android.content.Intent;
import android.net.Uri;
import android.database.Cursor;
import android.provider.OpenableColumns;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

@CapacitorPlugin(name = "GpxReceive")
public class GpxReceivePlugin extends Plugin {

    // Track the last processed intent to prevent duplicate processing.
    // Capacitor's Bridge re-dispatches the launch intent via handleOnNewIntent
    // after load() already processed it, causing double-fire on cold start.
    private Intent lastProcessedIntent = null;

    @Override
    public void load() {
        // Handle cold-start intent (app launched via share)
        Intent intent = getActivity().getIntent();
        handleIntent(intent);
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        // Handle warm-start intent (app already running)
        // Also called by Capacitor Bridge on cold start — dedup via lastProcessedIntent
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent == null) return;

        // Deduplicate: skip if this exact Intent object was already processed
        if (intent == lastProcessedIntent) return;

        String action = intent.getAction();

        Uri uri = null;
        if (Intent.ACTION_SEND.equals(action)) {
            uri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
        } else if (Intent.ACTION_VIEW.equals(action)) {
            uri = intent.getData();
        }

        if (uri == null) return;

        lastProcessedIntent = intent;

        try {
            String content = readContentFromUri(uri);
            String filename = getFilenameFromUri(uri);

            if (content != null && !content.isEmpty()) {
                JSObject data = new JSObject();
                data.put("content", content);
                data.put("filename", filename != null ? filename : "shared.gpx");
                // true = retain until JS listener attaches (critical for cold start)
                notifyListeners("gpxFileReceived", data, true);
            }
        } catch (Exception e) {
            // Log but don't crash — user can still use file picker
        }

        // Clear intent action to prevent re-processing via checkIntent
        getActivity().setIntent(new Intent());
    }

    private String readContentFromUri(Uri uri) throws Exception {
        InputStream inputStream = getActivity().getContentResolver().openInputStream(uri);
        if (inputStream == null) return null;
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line).append('\n');
        }
        reader.close();
        inputStream.close();
        return sb.toString();
    }

    private String getFilenameFromUri(Uri uri) {
        String filename = null;
        if ("content".equals(uri.getScheme())) {
            Cursor cursor = getActivity().getContentResolver().query(uri, null, null, null, null);
            if (cursor != null) {
                try {
                    if (cursor.moveToFirst()) {
                        int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                        if (nameIndex >= 0) {
                            filename = cursor.getString(nameIndex);
                        }
                    }
                } finally {
                    cursor.close();
                }
            }
        }
        if (filename == null) {
            filename = uri.getLastPathSegment();
        }
        return filename;
    }

    @PluginMethod
    public void checkIntent(PluginCall call) {
        Intent intent = getActivity().getIntent();
        if (intent == null) {
            call.resolve();
            return;
        }
        String action = intent.getAction();
        Uri uri = null;
        if (Intent.ACTION_SEND.equals(action)) {
            uri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
        } else if (Intent.ACTION_VIEW.equals(action)) {
            uri = intent.getData();
        }
        if (uri == null) {
            call.resolve();
            return;
        }
        try {
            String content = readContentFromUri(uri);
            String filename = getFilenameFromUri(uri);
            JSObject result = new JSObject();
            result.put("content", content);
            result.put("filename", filename != null ? filename : "shared.gpx");
            call.resolve(result);
            // Clear intent to prevent re-processing
            getActivity().setIntent(new Intent());
        } catch (Exception e) {
            call.reject("Failed to read shared file", e);
        }
    }
}
