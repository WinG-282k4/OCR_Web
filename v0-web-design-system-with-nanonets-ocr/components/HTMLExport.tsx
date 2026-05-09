"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { generateHTML, downloadHTML } from "@/lib/htmlExport";
import {
  Download,
  Copy,
  Eye,
  Code,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function HTMLExport() {
  const { components, order } = useAppSelector((state) => state.canvas);
  const [showPreview, setShowPreview] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const htmlContent = generateHTML(components, order);

  const handleDownload = () => {
    try {
      downloadHTML(components, order, "web-design.html");
      setExportError(null);
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : "Download failed"
      );
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      setExportError("Failed to copy to clipboard");
    }
  };

  if (order.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-6">
        <AlertCircle size={48} className="text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          No Components
        </h3>
        <p className="text-sm text-slate-600 text-center">
          Add components to your canvas first before exporting as HTML.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      {/* Export Toolbar */}
      <div className="px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Export HTML
            </h2>
            <p className="text-sm text-slate-600">
              {order.length} component{order.length !== 1 ? "s" : ""} ready
            </p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={18} />
            Download HTML
          </button>

          <button
            onClick={handleCopyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors"
          >
            <Copy size={18} />
            Copy Code
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors"
          >
            <Eye size={18} />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
        </div>

        {/* Success Message */}
        {copiedToClipboard && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mt-4">
            <CheckCircle2 size={18} className="text-green-600" />
            <p className="text-sm text-green-700">
              HTML code copied to clipboard!
            </p>
          </div>
        )}

        {/* Error Message */}
        {exportError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
            <AlertCircle size={18} className="text-red-600" />
            <p className="text-sm text-red-700">{exportError}</p>
          </div>
        )}
      </div>

      {/* Content Area */}
      {showPreview ? (
        <PreviewTab htmlContent={htmlContent} />
      ) : (
        <CodeTab htmlContent={htmlContent} />
      )}
    </div>
  );
}

// Code Display Tab
function CodeTab({ htmlContent }: { htmlContent: string }) {
  return (
    <div className="flex-1 overflow-auto bg-white">
      <pre className="p-6 font-mono text-sm text-slate-800 whitespace-pre-wrap break-words">
        <code>{htmlContent}</code>
      </pre>
    </div>
  );
}

// Preview Tab
function PreviewTab({ htmlContent }: { htmlContent: string }) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent]);

  return (
    <div className="flex-1 overflow-auto">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-none"
        title="HTML Preview"
        sandbox={{
          allow: [
            "same-origin",
            "scripts",
            "popups",
            "popups-to-escape-sandbox",
          ] as any,
        }}
      />
    </div>
  );
}
