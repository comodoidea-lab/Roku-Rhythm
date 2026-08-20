package com.comodoidealab.rokurhythm;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.DashPathEffect;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Typeface;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

final class NativeReceiptRenderer {

    static final int WIDTH = 1024;
    static final int HEIGHT = 1536;

    private static final float PAPER_LEFT = 124f;
    private static final float PAPER_TOP = 112f;
    private static final float PAPER_WIDTH = 776f;
    private static final float PAPER_HEIGHT = 1312f;
    private static final int INK = Color.rgb(23, 22, 93);
    private static final int BODY = Color.rgb(220, 85, 79);
    private static final int EMOTION = Color.rgb(47, 159, 149);
    private static final int MIND = Color.rgb(22, 138, 178);
    private static final Typeface SANS = Typeface.create("sans-serif", Typeface.NORMAL);
    private static final Typeface SANS_BOLD = Typeface.create("sans-serif", Typeface.BOLD);
    private static final Typeface MONO = Typeface.create(Typeface.MONOSPACE, Typeface.NORMAL);
    private static final Typeface MONO_BOLD = Typeface.create(Typeface.MONOSPACE, Typeface.BOLD);

    static final class ReceiptData {

        final String formattedDate;
        final String rokuyo;
        final String comment;
        final String bodyValue;
        final String bodyAssessment;
        final String emotionValue;
        final String emotionAssessment;
        final String mindValue;
        final String mindAssessment;
        final int[] physicalWaves;
        final int[] emotionalWaves;
        final int[] intellectualWaves;

        ReceiptData(
            String formattedDate,
            String rokuyo,
            String comment,
            String bodyValue,
            String bodyAssessment,
            String emotionValue,
            String emotionAssessment,
            String mindValue,
            String mindAssessment,
            int[] physicalWaves,
            int[] emotionalWaves,
            int[] intellectualWaves
        ) {
            this.formattedDate = formattedDate;
            this.rokuyo = rokuyo;
            this.comment = comment;
            this.bodyValue = bodyValue;
            this.bodyAssessment = bodyAssessment;
            this.emotionValue = emotionValue;
            this.emotionAssessment = emotionAssessment;
            this.mindValue = mindValue;
            this.mindAssessment = mindAssessment;
            this.physicalWaves = physicalWaves;
            this.emotionalWaves = emotionalWaves;
            this.intellectualWaves = intellectualWaves;
        }
    }

    File render(Context context, ReceiptData data) throws IOException {
        Bitmap receipt = Bitmap.createBitmap(WIDTH, HEIGHT, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(receipt);

        drawBackground(context, canvas);
        Path paper = buildPaperPath();
        drawPaper(canvas, paper);
        drawLogo(context, canvas);
        drawReceiptContent(canvas, data);

        File directory = new File(context.getCacheDir(), "native_receipts");
        if (!directory.exists() && !directory.mkdirs()) {
            receipt.recycle();
            throw new IOException("Could not create the native receipt cache.");
        }
        cleanExpiredReceipts(directory);

        File output = new File(directory, "roku-rhythm-" + System.currentTimeMillis() + ".jpg");
        try (FileOutputStream stream = new FileOutputStream(output)) {
            if (!receipt.compress(Bitmap.CompressFormat.JPEG, 92, stream)) {
                throw new IOException("Could not encode the native receipt.");
            }
        } finally {
            receipt.recycle();
        }

        if (output.length() < 10_000L) {
            output.delete();
            throw new IOException("The native receipt image was empty.");
        }

        return output;
    }

    private void drawBackground(Context context, Canvas canvas) {
        Bitmap background = loadAsset(context, "public/receipt-share-bg.jpg");
        if (background != null) {
            canvas.drawBitmap(background, null, new Rect(0, 0, WIDTH, HEIGHT), new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG));
            background.recycle();
            return;
        }

        Paint fallback = new Paint(Paint.ANTI_ALIAS_FLAG);
        fallback.setShader(
            new LinearGradient(
                0,
                0,
                WIDTH,
                HEIGHT,
                new int[] { Color.rgb(20, 19, 67), Color.rgb(62, 47, 127), Color.rgb(11, 54, 91) },
                null,
                Shader.TileMode.CLAMP
            )
        );
        canvas.drawRect(0, 0, WIDTH, HEIGHT, fallback);
    }

    private Path buildPaperPath() {
        float right = PAPER_LEFT + PAPER_WIDTH;
        float bottom = PAPER_TOP + PAPER_HEIGHT;
        int teeth = 19;
        float segment = PAPER_WIDTH / teeth;
        Path path = new Path();
        path.moveTo(PAPER_LEFT, PAPER_TOP + 10f);

        for (int index = 0; index < teeth; index += 1) {
            float x = PAPER_LEFT + index * segment;
            path.lineTo(x + segment * 0.2f, PAPER_TOP + 2f);
            path.quadTo(x + segment * 0.5f, PAPER_TOP + 18f, x + segment * 0.8f, PAPER_TOP + 2f);
            path.lineTo(x + segment, PAPER_TOP + 10f);
        }

        path.lineTo(right, bottom - 10f);
        for (int index = teeth - 1; index >= 0; index -= 1) {
            float x = PAPER_LEFT + index * segment;
            path.lineTo(x + segment * 0.8f, bottom - 2f);
            path.quadTo(x + segment * 0.5f, bottom - 18f, x + segment * 0.2f, bottom - 2f);
            path.lineTo(x, bottom - 10f);
        }
        path.close();
        return path;
    }

    private void drawPaper(Canvas canvas, Path paper) {
        Paint shadow = new Paint(Paint.ANTI_ALIAS_FLAG);
        shadow.setColor(Color.argb(86, 2, 4, 30));
        canvas.save();
        canvas.translate(0f, 18f);
        canvas.drawPath(paper, shadow);
        canvas.restore();

        Paint fill = new Paint(Paint.ANTI_ALIAS_FLAG);
        fill.setColor(Color.rgb(255, 250, 240));
        canvas.drawPath(paper, fill);

        canvas.save();
        canvas.clipPath(paper);
        Random random = new Random(629L);
        Paint texture = new Paint();
        for (int index = 0; index < 1_200; index += 1) {
            float x = PAPER_LEFT + random.nextFloat() * PAPER_WIDTH;
            float y = PAPER_TOP + random.nextFloat() * PAPER_HEIGHT;
            int alpha = 4 + random.nextInt(6);
            texture.setColor(random.nextBoolean() ? Color.argb(alpha, 80, 61, 38) : Color.argb(alpha + 5, 255, 255, 255));
            canvas.drawCircle(x, y, 0.8f + random.nextFloat() * 1.2f, texture);
        }
        canvas.restore();
    }

    private void drawLogo(Context context, Canvas canvas) {
        float centerX = WIDTH / 2f;
        float centerY = 218f;
        float radius = 42f;
        Bitmap logo = loadAsset(context, "public/icon-512.png");

        canvas.save();
        Path clip = new Path();
        clip.addCircle(centerX, centerY, radius, Path.Direction.CW);
        canvas.clipPath(clip);
        if (logo != null) {
            canvas.drawBitmap(
                logo,
                null,
                new RectF(centerX - radius, centerY - radius, centerX + radius, centerY + radius),
                new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG)
            );
            logo.recycle();
        } else {
            Paint fallback = new Paint(Paint.ANTI_ALIAS_FLAG);
            fallback.setColor(Color.rgb(75, 56, 217));
            canvas.drawCircle(centerX, centerY, radius, fallback);
        }
        canvas.restore();
    }

    private void drawReceiptContent(Canvas canvas, ReceiptData data) {
        drawSpacedText(canvas, "ROKU RHYTHM", WIDTH / 2f, 318f, 8f, 60f, SANS_BOLD, INK);
        drawDashedLine(canvas, 374f);
        drawSpacedText(canvas, "DAILY RECEIPT", WIDTH / 2f, 430f, 9f, 31f, MONO_BOLD, INK);
        drawCenteredText(canvas, data.formattedDate, 496f, 43f, MONO, INK);
        drawDashedLine(canvas, 548f);

        drawText(canvas, "ROKUYO", PAPER_LEFT + 66f, 608f, 36f, MONO, INK, Paint.Align.LEFT);
        drawText(canvas, data.rokuyo, PAPER_LEFT + PAPER_WIDTH - 66f, 608f, 44f, SANS_BOLD, INK, Paint.Align.RIGHT);
        drawDashedLine(canvas, 657f);

        drawMetric(canvas, "BODY", data.bodyValue, data.bodyAssessment, 718f, BODY);
        drawMetric(canvas, "EMOTION", data.emotionValue, data.emotionAssessment, 790f, EMOTION);
        drawMetric(canvas, "MIND", data.mindValue, data.mindAssessment, 862f, MIND);
        drawDashedLine(canvas, 916f);

        Paint commentPaint = textPaint(34f, SANS_BOLD, INK, Paint.Align.CENTER);
        List<String> commentLines = wrapText(data.comment, commentPaint, PAPER_WIDTH - 150f, 3);
        for (int index = 0; index < commentLines.size(); index += 1) {
            drawTextWithPaint(canvas, commentLines.get(index), WIDTH / 2f, 968f + index * 46f, commentPaint);
        }

        drawWaves(canvas, data);
        drawDashedLine(canvas, 1260f);
        drawSpacedText(canvas, "#RokuRhythm", WIDTH / 2f, 1310f, 2f, 30f, MONO, INK);
        drawDashedLine(canvas, 1350f);
        drawSpacedText(canvas, "ENTERTAINMENT ONLY", WIDTH / 2f, 1386f, 5f, 20f, MONO_BOLD, INK);
    }

    private void drawMetric(Canvas canvas, String label, String value, String assessment, float y, int color) {
        drawText(canvas, label, PAPER_LEFT + 66f, y, 33f, MONO, INK, Paint.Align.LEFT);
        drawText(canvas, value, WIDTH / 2f + 8f, y, 43f, MONO, color, Paint.Align.CENTER);
        drawText(canvas, assessment, PAPER_LEFT + PAPER_WIDTH - 66f, y, 31f, SANS_BOLD, color, Paint.Align.RIGHT);
    }

    private void drawDashedLine(Canvas canvas, float y) {
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(2f);
        paint.setColor(Color.argb(184, 41, 37, 110));
        paint.setPathEffect(new DashPathEffect(new float[] { 14f, 13f }, 0f));
        canvas.drawLine(PAPER_LEFT + 56f, y, PAPER_LEFT + PAPER_WIDTH - 56f, y, paint);
    }

    private void drawWaves(Canvas canvas, ReceiptData data) {
        drawWave(canvas, data.physicalWaves, BODY);
        drawWave(canvas, data.emotionalWaves, EMOTION);
        drawWave(canvas, data.intellectualWaves, MIND);
    }

    private void drawWave(Canvas canvas, int[] values, int color) {
        if (values == null || values.length < 2) return;

        float left = PAPER_LEFT + 58f;
        float right = PAPER_LEFT + PAPER_WIDTH - 58f;
        float top = 1060f;
        float chartHeight = 168f;
        float chartWidth = right - left;
        float[] xs = new float[values.length];
        float[] ys = new float[values.length];

        for (int index = 0; index < values.length; index += 1) {
            xs[index] = left + ((float) index / (values.length - 1)) * chartWidth;
            ys[index] = top + chartHeight / 2f - (Math.max(-100, Math.min(100, values[index])) / 100f) * (chartHeight / 2f);
        }

        Path path = new Path();
        path.moveTo(xs[0], ys[0]);
        for (int index = 1; index < values.length - 1; index += 1) {
            float midpointX = (xs[index] + xs[index + 1]) / 2f;
            float midpointY = (ys[index] + ys[index + 1]) / 2f;
            path.quadTo(xs[index], ys[index], midpointX, midpointY);
        }
        int last = values.length - 1;
        path.quadTo(xs[last - 1], ys[last - 1], xs[last], ys[last]);

        Paint line = new Paint(Paint.ANTI_ALIAS_FLAG);
        line.setStyle(Paint.Style.STROKE);
        line.setStrokeWidth(5f);
        line.setStrokeCap(Paint.Cap.ROUND);
        line.setStrokeJoin(Paint.Join.ROUND);
        line.setColor(color);
        canvas.drawPath(path, line);

        Paint dot = new Paint(Paint.ANTI_ALIAS_FLAG);
        dot.setColor(color);
        canvas.drawCircle(xs[last], ys[last], 10f, dot);
    }

    private void drawCenteredText(Canvas canvas, String text, float centerY, float size, Typeface typeface, int color) {
        drawText(canvas, text, WIDTH / 2f, centerY, size, typeface, color, Paint.Align.CENTER);
    }

    private void drawText(
        Canvas canvas,
        String text,
        float x,
        float centerY,
        float size,
        Typeface typeface,
        int color,
        Paint.Align align
    ) {
        drawTextWithPaint(canvas, text, x, centerY, textPaint(size, typeface, color, align));
    }

    private Paint textPaint(float size, Typeface typeface, int color, Paint.Align align) {
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.SUBPIXEL_TEXT_FLAG);
        paint.setTextSize(size);
        paint.setTypeface(typeface);
        paint.setColor(color);
        paint.setTextAlign(align);
        return paint;
    }

    private void drawTextWithPaint(Canvas canvas, String text, float x, float centerY, Paint paint) {
        String safeText = text == null ? "" : text;
        Paint.FontMetrics metrics = paint.getFontMetrics();
        float baseline = centerY - (metrics.ascent + metrics.descent) / 2f;
        canvas.drawText(safeText, x, baseline, paint);
    }

    private void drawSpacedText(
        Canvas canvas,
        String text,
        float centerX,
        float centerY,
        float spacing,
        float size,
        Typeface typeface,
        int color
    ) {
        Paint paint = textPaint(size, typeface, color, Paint.Align.LEFT);
        List<String> characters = toCharacters(text);
        float totalWidth = spacing * Math.max(0, characters.size() - 1);
        for (String character : characters) totalWidth += paint.measureText(character);
        float x = centerX - totalWidth / 2f;
        Paint.FontMetrics metrics = paint.getFontMetrics();
        float baseline = centerY - (metrics.ascent + metrics.descent) / 2f;

        for (String character : characters) {
            canvas.drawText(character, x, baseline, paint);
            x += paint.measureText(character) + spacing;
        }
    }

    private List<String> wrapText(String value, Paint paint, float maxWidth, int maxLines) {
        List<String> lines = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        for (String character : toCharacters(value == null ? "" : value)) {
            String next = current.toString() + character;
            if (current.length() > 0 && paint.measureText(next) > maxWidth) {
                lines.add(current.toString());
                current.setLength(0);
                current.append(character);
                if (lines.size() == maxLines) break;
            } else {
                current.append(character);
            }
        }
        if (lines.size() < maxLines && current.length() > 0) lines.add(current.toString());
        return lines;
    }

    private List<String> toCharacters(String value) {
        List<String> characters = new ArrayList<>();
        value.codePoints().forEach(codePoint -> characters.add(new String(Character.toChars(codePoint))));
        return characters;
    }

    private Bitmap loadAsset(Context context, String path) {
        try (InputStream stream = context.getAssets().open(path)) {
            return BitmapFactory.decodeStream(stream);
        } catch (IOException ignored) {
            return null;
        }
    }

    private void cleanExpiredReceipts(File directory) {
        File[] files = directory.listFiles();
        if (files == null) return;
        long cutoff = System.currentTimeMillis() - 24L * 60L * 60L * 1000L;
        for (File file : files) {
            if (file.isFile() && file.lastModified() < cutoff) file.delete();
        }
    }
}
