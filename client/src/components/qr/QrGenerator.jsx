import { QRCodeSVG } from 'qrcode.react';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function QrGenerator({ sessionId, className = "" }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="p-4 bg-white rounded-lg border border-gray-200 mb-4">
        <QRCodeSVG
          value={sessionId}
          size={200}
          level="H"
          includeMargin={true}
          fgColor="#0ea5e9" // Tailwind primary-500
        />
      </div>
      
      <div className="flex items-center bg-gray-50 p-3 rounded-lg w-full">
        <p className="text-sm font-mono text-gray-700 truncate flex-1">
          {sessionId}
        </p>
        <button
          onClick={copyToClipboard}
          className="ml-2 flex-shrink-0 p-2 rounded-md hover:bg-gray-100"
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <CheckIcon className="h-5 w-5 text-green-500" />
          ) : (
            <ClipboardDocumentIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>
    </div>
  );
}