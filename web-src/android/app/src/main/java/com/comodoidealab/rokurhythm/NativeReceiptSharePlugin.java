package com.comodoidealab.rokurhythm;

import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

@CapacitorPlugin(name = "NativeReceiptShare")
public class NativeReceiptSharePlugin extends Plugin {

    private final ExecutorService rendererExecutor = Executors.newSingleThreadExecutor();
    private final AtomicBoolean sharing = new AtomicBoolean(false);
    private final NativeReceiptRenderer renderer = new NativeReceiptRenderer();

    @PluginMethod
    public void share(PluginCall call) {
        if (!sharing.compareAndSet(false, true)) {
            call.reject("A receipt share is already being prepared.", "SHARE_IN_PROGRESS");
            return;
        }

        final NativeReceiptRenderer.ReceiptData receiptData;
        final String title;
        final String text;
        final String dialogTitle;

        try {
            receiptData = new NativeReceiptRenderer.ReceiptData(
                requireString(call, "formattedDate"),
                requireString(call, "rokuyo"),
                call.getString("comment", ""),
                requireString(call, "bodyValue"),
                requireString(call, "bodyAssessment"),
                requireString(call, "emotionValue"),
                requireString(call, "emotionAssessment"),
                requireString(call, "mindValue"),
                requireString(call, "mindAssessment"),
                requireWaveValues(call, "physicalWaves"),
                requireWaveValues(call, "emotionalWaves"),
                requireWaveValues(call, "intellectualWaves")
            );
            title = call.getString("title", "Roku Rhythm");
            text = call.getString("text", "");
            dialogTitle = call.getString("dialogTitle", "結果を共有");
        } catch (IllegalArgumentException error) {
            sharing.set(false);
            call.reject(error.getMessage(), "INVALID_RECEIPT");
            return;
        }

        rendererExecutor.execute(() -> {
            try {
                File receiptFile = renderer.render(getContext(), receiptData);
                Uri contentUri = FileProvider.getUriForFile(
                    getContext(),
                    getContext().getPackageName() + ".fileprovider",
                    receiptFile
                );

                Intent shareIntent = new Intent(Intent.ACTION_SEND);
                shareIntent.setType("image/jpeg");
                shareIntent.putExtra(Intent.EXTRA_STREAM, contentUri);
                shareIntent.putExtra(Intent.EXTRA_SUBJECT, title);
                shareIntent.putExtra(Intent.EXTRA_TEXT, text);
                shareIntent.setClipData(ClipData.newRawUri("Roku Rhythm receipt", contentUri));
                shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

                Intent chooser = Intent.createChooser(shareIntent, dialogTitle);
                chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

                bridge.executeOnMainThread(() -> {
                    try {
                        getActivity().startActivity(chooser);
                        JSObject result = new JSObject();
                        result.put("presented", true);
                        result.put("size", receiptFile.length());
                        call.resolve(result);
                    } catch (Exception error) {
                        call.reject("Could not open the Android share sheet.", "SHARE_SHEET_FAILED", error);
                    } finally {
                        sharing.set(false);
                    }
                });
            } catch (Exception error) {
                bridge.executeOnMainThread(() -> {
                    sharing.set(false);
                    call.reject("Could not create the native receipt image.", "RECEIPT_RENDER_FAILED", error);
                });
            }
        });
    }

    private String requireString(PluginCall call, String name) {
        String value = call.getString(name);
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Missing receipt value: " + name);
        }
        return value;
    }

    private int[] requireWaveValues(PluginCall call, String name) {
        JSArray values = call.getArray(name);
        if (values == null || values.length() < 2) {
            throw new IllegalArgumentException("Missing receipt wave values: " + name);
        }

        int[] result = new int[values.length()];
        for (int index = 0; index < values.length(); index += 1) {
            result[index] = (int) Math.round(values.optDouble(index, 0d));
        }
        return result;
    }

    @Override
    protected void handleOnDestroy() {
        rendererExecutor.shutdownNow();
    }
}
