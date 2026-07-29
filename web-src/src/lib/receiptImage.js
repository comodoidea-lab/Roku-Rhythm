import { buildReceiptModel } from "./receipt.js";

const WIDTH = 1024;
const HEIGHT = 1536;
const PAPER = {
  left: 124,
  top: 112,
  width: 776,
  height: 1312,
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "sync";
    image.onload = async () => {
      try {
        if (typeof image.decode === "function") {
          await image.decode();
        }
        resolve(image);
      } catch (error) {
        if (image.complete && image.naturalWidth > 0) {
          resolve(image);
        } else {
          reject(error);
        }
      }
    };
    image.onerror = reject;
    image.src = src;
  });
}

function traceReceiptPaper(context) {
  const { left, top, width, height } = PAPER;
  const right = left + width;
  const bottom = top + height;
  const teeth = 19;
  const segment = width / teeth;

  context.beginPath();
  context.moveTo(left, top + 10);

  for (let index = 0; index < teeth; index += 1) {
    const x = left + index * segment;
    context.lineTo(x + segment * 0.2, top + 2);
    context.quadraticCurveTo(
      x + segment * 0.5,
      top + 18,
      x + segment * 0.8,
      top + 2,
    );
    context.lineTo(x + segment, top + 10);
  }

  context.lineTo(right, bottom - 10);

  for (let index = teeth - 1; index >= 0; index -= 1) {
    const x = left + index * segment;
    context.lineTo(x + segment * 0.8, bottom - 2);
    context.quadraticCurveTo(
      x + segment * 0.5,
      bottom - 18,
      x + segment * 0.2,
      bottom - 2,
    );
    context.lineTo(x, bottom - 10);
  }

  context.closePath();
}

function seededRandom(seed) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function drawPaper(context) {
  context.save();
  context.shadowColor = "rgba(2, 4, 30, 0.45)";
  context.shadowBlur = 34;
  context.shadowOffsetY = 18;
  context.fillStyle = "#fffaf0";
  traceReceiptPaper(context);
  context.fill();
  context.restore();

  context.save();
  traceReceiptPaper(context);
  context.clip();

  const random = seededRandom(629);
  for (let index = 0; index < 3200; index += 1) {
    const x = PAPER.left + random() * PAPER.width;
    const y = PAPER.top + random() * PAPER.height;
    const alpha = 0.012 + random() * 0.022;
    context.fillStyle =
      random() > 0.55
        ? `rgba(80, 61, 38, ${alpha})`
        : `rgba(255, 255, 255, ${alpha * 1.8})`;
    context.fillRect(x, y, 1 + random() * 2, 1 + random() * 2);
  }

  context.restore();
}

function drawDashedLine(context, y, color = "#29256e") {
  context.save();
  context.strokeStyle = color;
  context.globalAlpha = 0.72;
  context.lineWidth = 2;
  context.setLineDash([14, 13]);
  context.beginPath();
  context.moveTo(PAPER.left + 56, y);
  context.lineTo(PAPER.left + PAPER.width - 56, y);
  context.stroke();
  context.restore();
}

function drawCenteredText(context, text, y, font, color = "#17165d") {
  context.save();
  context.fillStyle = color;
  context.font = font;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, WIDTH / 2, y);
  context.restore();
}

function drawSpacedText(context, text, centerX, y, spacing, font, color) {
  context.save();
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = "middle";

  const characters = Array.from(text);
  const widths = characters.map((character) => context.measureText(character).width);
  const totalWidth =
    widths.reduce((total, width) => total + width, 0) +
    spacing * Math.max(0, characters.length - 1);
  let x = centerX - totalWidth / 2;

  characters.forEach((character, index) => {
    context.fillText(character, x, y);
    x += widths[index] + spacing;
  });

  context.restore();
}

function wrapText(context, text, maxWidth) {
  const characters = Array.from(text);
  const lines = [];
  let line = "";

  for (const character of characters) {
    const nextLine = `${line}${character}`;
    if (line && context.measureText(nextLine).width > maxWidth) {
      lines.push(line);
      line = character;
    } else {
      line = nextLine;
    }
  }

  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function drawSmoothWave(context, points, color, currentIndex) {
  if (!points.length) return;

  context.save();
  context.strokeStyle = color;
  context.lineWidth = 5;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length - 1; index += 1) {
    const midpointX = (points[index].x + points[index + 1].x) / 2;
    const midpointY = (points[index].y + points[index + 1].y) / 2;
    context.quadraticCurveTo(
      points[index].x,
      points[index].y,
      midpointX,
      midpointY,
    );
  }

  const last = points.at(-1);
  const previous = points.at(-2);
  context.quadraticCurveTo(previous.x, previous.y, last.x, last.y);
  context.stroke();

  const current = points[currentIndex];
  context.fillStyle = color;
  context.beginPath();
  context.arc(current.x, current.y, 10, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawWaves(context, model) {
  const left = PAPER.left + 58;
  const right = PAPER.left + PAPER.width - 58;
  const top = 1060;
  const height = 168;
  const width = right - left;
  const currentIndex = model.waves.findIndex((entry) => entry.current);

  model.metrics.forEach((metric) => {
    const points = model.waves.map((entry, index) => ({
      x: left + (index / (model.waves.length - 1)) * width,
      y: top + height / 2 - (entry[metric.key] / 100) * (height / 2),
    }));

    drawSmoothWave(context, points, metric.color, currentIndex);
  });
}

async function renderReceiptCanvas(result) {
  const model = buildReceiptModel(result);
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  const [background, logo] = await Promise.all([
    loadImage("/receipt-share-bg.jpg"),
    loadImage("/icon-512.png"),
  ]);

  context.drawImage(background, 0, 0, WIDTH, HEIGHT);
  drawPaper(context);

  context.save();
  context.beginPath();
  context.arc(WIDTH / 2, 218, 42, 0, Math.PI * 2);
  context.clip();
  context.drawImage(logo, WIDTH / 2 - 42, 176, 84, 84);
  context.restore();

  drawSpacedText(
    context,
    "ROKU RHYTHM",
    WIDTH / 2,
    318,
    8,
    '600 60px "Avenir Next Condensed", "Arial Narrow", sans-serif',
    "#17165d",
  );
  drawDashedLine(context, 374);
  drawSpacedText(
    context,
    "DAILY RECEIPT",
    WIDTH / 2,
    430,
    9,
    '600 31px "SFMono-Regular", Menlo, monospace',
    "#17165d",
  );
  drawCenteredText(
    context,
    model.formattedDate,
    496,
    '400 43px "SFMono-Regular", Menlo, monospace',
  );
  drawDashedLine(context, 548);

  context.save();
  context.textBaseline = "middle";
  context.fillStyle = "#17165d";
  context.font = '500 36px "SFMono-Regular", Menlo, monospace';
  context.fillText("ROKUYO", PAPER.left + 66, 608);
  context.textAlign = "right";
  context.font = '700 44px "Hiragino Sans", "Yu Gothic", sans-serif';
  context.fillText(model.rokuyo, PAPER.left + PAPER.width - 66, 608);
  context.restore();
  drawDashedLine(context, 657);

  model.metrics.forEach((metric, index) => {
    const y = 718 + index * 72;
    context.save();
    context.textBaseline = "middle";
    context.fillStyle = "#17165d";
    context.font = '500 33px "SFMono-Regular", Menlo, monospace';
    context.fillText(metric.label, PAPER.left + 66, y);
    context.fillStyle = metric.color;
    context.textAlign = "center";
    context.font = '500 43px "SFMono-Regular", Menlo, monospace';
    context.fillText(metric.formattedValue, WIDTH / 2 + 8, y);
    context.textAlign = "right";
    context.font = '700 31px "Hiragino Sans", "Yu Gothic", sans-serif';
    context.fillText(
      metric.assessment,
      PAPER.left + PAPER.width - 66,
      y,
    );
    context.restore();
  });

  drawDashedLine(context, 916);

  context.save();
  context.font = '700 34px "Hiragino Sans", "Yu Gothic", sans-serif';
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#17165d";
  const commentLines = wrapText(context, model.comment, PAPER.width - 150);
  commentLines.forEach((line, index) => {
    context.fillText(line, WIDTH / 2, 968 + index * 46);
  });
  context.restore();

  drawWaves(context, model);
  drawDashedLine(context, 1260);
  drawSpacedText(
    context,
    "#RokuRhythm",
    WIDTH / 2,
    1310,
    2,
    '500 30px "SFMono-Regular", Menlo, monospace',
    "#17165d",
  );

  context.save();
  context.globalAlpha = 0.5;
  drawDashedLine(context, 1350);
  context.restore();
  drawSpacedText(
    context,
    "ENTERTAINMENT ONLY",
    WIDTH / 2,
    1386,
    5,
    '600 20px "SFMono-Regular", Menlo, monospace',
    "#17165d",
  );

  const cornerPixel = context.getImageData(8, 8, 1, 1).data;
  const cornerIsBlank =
    cornerPixel[3] === 0 ||
    (cornerPixel[0] > 248 &&
      cornerPixel[1] > 248 &&
      cornerPixel[2] > 248);

  if (cornerIsBlank) {
    throw new Error("receipt-canvas-blank");
  }

  return canvas;
}

export async function renderReceiptPng(result) {
  const canvas = await renderReceiptCanvas(result);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("receipt-image-creation-failed"));
    }, "image/png");
  });
}

export async function renderReceiptPngBase64(result) {
  const canvas = await renderReceiptCanvas(result);

  await new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });

  const dataUrl = canvas.toDataURL("image/png");
  const base64 = dataUrl.split(",")[1];

  if (!base64 || base64.length < 16_000) {
    throw new Error("receipt-image-empty");
  }

  return base64;
}
