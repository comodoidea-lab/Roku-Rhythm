import { useEffect, useMemo, useRef } from "react";
import { Download, LoaderCircle, Share2, X } from "lucide-react";
import { buildReceiptModel } from "../lib/receipt.js";
import ReceiptMiniChart from "./ReceiptMiniChart.jsx";

export default function ReceiptSheet({
  isOpen,
  onClose,
  onShare,
  sharing,
  shareMessage,
  result,
}) {
  const panelRef = useRef(null);
  const scrollRef = useRef(null);
  const model = useMemo(
    () => (result ? buildReceiptModel(result) : null),
    [result],
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus({ preventScroll: true });
    window.requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    });

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !model) return null;

  return (
    <div
      className="receipt-sheet-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-sheet-title"
      data-testid="receipt-sheet"
    >
      <button
        type="button"
        className="receipt-sheet-backdrop"
        onClick={onClose}
        aria-label="レシートを閉じる"
      />

      <section
        ref={panelRef}
        className="receipt-sheet-panel"
        tabIndex={-1}
      >
        <div className="receipt-sheet-handle" aria-hidden="true" />
        <div className="receipt-sheet-header">
          <div>
            <p className="receipt-sheet-kicker">SHARE PREVIEW</p>
            <h2 id="receipt-sheet-title">今日の六曜レシート</h2>
          </div>
          <button
            type="button"
            className="receipt-sheet-close"
            onClick={onClose}
            aria-label="閉じる"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <div ref={scrollRef} className="receipt-sheet-scroll">
          <div className="receipt-stage">
            <div className="receipt-paper-shadow">
              <article className="receipt-paper" data-testid="receipt-preview">
                <div className="receipt-brand-mark">
                  <img src="/icon-512.png" alt="" aria-hidden="true" />
                </div>
                <p className="receipt-wordmark">ROKU RHYTHM</p>
                <div className="receipt-rule" />
                <p className="receipt-label">DAILY RECEIPT</p>
                <p className="receipt-date">{model.formattedDate}</p>
                <div className="receipt-rule" />

                <div className="receipt-rokuyo-row">
                  <span>ROKUYO</span>
                  <strong>{model.rokuyo}</strong>
                </div>
                <div className="receipt-rule" />

                <div className="receipt-metrics">
                  {model.metrics.map((metric) => (
                    <div className="receipt-metric" key={metric.key}>
                      <span className="receipt-metric-name">{metric.label}</span>
                      <strong style={{ color: metric.color }}>
                        {metric.formattedValue}
                      </strong>
                      <span
                        className="receipt-assessment"
                        style={{ color: metric.color }}
                      >
                        {metric.assessment}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="receipt-rule" />
                <p className="receipt-comment">{model.comment}</p>
                <ReceiptMiniChart
                  metrics={model.metrics}
                  waves={model.waves}
                />
                <div className="receipt-rule" />
                <p className="receipt-hashtag">#RokuRhythm</p>
                <div className="receipt-fine-rule" />
                <p className="receipt-disclaimer">ENTERTAINMENT ONLY</p>
              </article>
            </div>
          </div>
        </div>

        <div className="receipt-sheet-actions">
          <button
            type="button"
            className="receipt-share-button"
            onClick={onShare}
            disabled={sharing}
            data-testid="share-receipt"
          >
            {sharing ? (
              <LoaderCircle
                className="animate-spin"
                size={21}
                aria-hidden="true"
              />
            ) : (
              <Share2 size={21} aria-hidden="true" />
            )}
            <span>{sharing ? "画像を準備中…" : "このレシートを画像で共有"}</span>
          </button>

          <p className="receipt-share-note" aria-live="polite">
            {shareMessage ? (
              shareMessage
            ) : (
              <>
                <Download size={15} aria-hidden="true" />
                共有できないブラウザではPNGを保存します
              </>
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
