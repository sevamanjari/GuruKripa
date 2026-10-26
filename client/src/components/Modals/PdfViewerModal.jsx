import React, { useState, useEffect } from "react";
import { X, ExternalLink, Download, FileText, Loader2, Sparkles } from "lucide-react";
import { resolveDocumentToViewableUrl } from "../../services/api.js";

export default function PdfViewerModal({ isOpen, onClose, documentUrl, title = "Document Viewer" }) {
  const [resolvedUrl, setResolvedUrl] = useState("");
  const [isDecompressing, setIsDecompressing] = useState(false);
  const isCompressed = Boolean(documentUrl && typeof documentUrl === "string" && documentUrl.startsWith("gz:"));

  useEffect(() => {
    let isMounted = true;
    let createdBlobUrl = null;

    if (isOpen && documentUrl) {
      if (documentUrl.startsWith("gz:")) {
        setIsDecompressing(true);
        resolveDocumentToViewableUrl(documentUrl)
          .then((url) => {
            if (isMounted) {
              setResolvedUrl(url);
              if (url.startsWith("blob:")) {
                createdBlobUrl = url;
              }
            }
          })
          .catch((err) => {
            console.error("Failed to decompress document:", err);
            if (isMounted) setResolvedUrl(documentUrl);
          })
          .finally(() => {
            if (isMounted) setIsDecompressing(false);
          });
      } else {
        setResolvedUrl(documentUrl);
        setIsDecompressing(false);
      }
    } else {
      setResolvedUrl("");
      setIsDecompressing(false);
    }

    return () => {
      isMounted = false;
      if (createdBlobUrl) {
        URL.revokeObjectURL(createdBlobUrl);
      }
    };
  }, [isOpen, documentUrl]);

  if (!isOpen || !documentUrl) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "920px",
          height: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border-default, #e2e8f0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f8fafc",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FileText size={20} color="var(--brand-primary, #1e3a8a)" />
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>
                {title}
              </h3>
              {isCompressed && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", color: "#16a34a", fontWeight: 600, marginTop: "2px" }}>
                  <Sparkles size={11} />
                  <span>Atlas Gzip Compressed • Instant in-memory decompression</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {resolvedUrl && (
              <>
                <a
                  href={resolvedUrl}
                  download={`${title.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`}
                  className="btn btn-secondary btn-sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </a>
                <a
                  href={resolvedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
                >
                  <ExternalLink size={14} />
                  <span>Open in Tab</span>
                </a>
              </>
            )}
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "6px",
                color: "var(--text-muted, #64748b)"
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div style={{ flex: 1, background: "#334155", position: "relative" }}>
          {isDecompressing ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                gap: "12px"
              }}
            >
              <Loader2 size={32} className="spin" style={{ animation: "spin 1s linear infinite" }} />
              <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>Decompressing PDF in memory...</div>
              <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>Restoring original document from compressed Atlas storage</div>
            </div>
          ) : resolvedUrl ? (
            <iframe
              src={resolvedUrl}
              title={title}
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8"
              }}
            >
              No document available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
