import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Copy,
  Download,
  CheckCircle2,
  ExternalLink,
  Code2,
  Layers,
  Sparkles,
  PlayCircle,
  HelpCircle,
} from 'lucide-react';
import { generateGoogleAppsScriptCode } from '../utils/googleAppsScriptGenerator';

export const GoogleAppsScriptView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const appScriptCode = generateGoogleAppsScriptCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(appScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([appScriptCode], { type: 'text/javascript' });
    element.href = URL.createObjectURL(file);
    element.download = 'Sathi_Sajilo_Hisab_GoogleAppsScript.gs';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">Google Sheets Apps Script Integration Engine</h1>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold font-mono">
                Ready to Deploy
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Complete standalone Apps Script engine for Google Sheets managing your 7-member group with 25-day cycles, dual BS/AD dates, and automatic triggers.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-2 transition-colors active:scale-95 cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Full Apps Script Code'}
          </button>

          <button
            onClick={handleDownload}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-400" />
            Download .gs Script File
          </button>

          <a
            href="https://sheets.new"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            Open Google Sheets (sheets.new)
          </a>
        </div>
      </div>

      {/* Step-by-Step Instructions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-blue-600" />
          5-Step Setup Guide in Google Sheets
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="w-5 h-5 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
              1
            </div>
            <div className="font-bold text-slate-900">Create Sheet</div>
            <p className="text-slate-500 text-[11px]">
              Open a new Google Sheet and name it <strong>"Sathi Sajilo Hisab"</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="w-5 h-5 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
              2
            </div>
            <div className="font-bold text-slate-900">Open Apps Script</div>
            <p className="text-slate-500 text-[11px]">
              Click <strong>Extensions &gt; Apps Script</strong> in your top menu bar.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="w-5 h-5 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
              3
            </div>
            <div className="font-bold text-slate-900">Paste Code</div>
            <p className="text-slate-500 text-[11px]">
              Replace contents of <code>Code.gs</code> with the code below and hit <strong>Save (Ctrl+S)</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="w-5 h-5 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
              4
            </div>
            <div className="font-bold text-slate-900">Run Initializer</div>
            <p className="text-slate-500 text-[11px]">
              Select and run <code>initSathiSajiloSheets()</code>. It will build all sheet tabs with formatting.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <div className="w-5 h-5 rounded bg-purple-600 text-white font-bold flex items-center justify-center text-[10px]">
              5
            </div>
            <div className="font-bold text-slate-900">Install Triggers</div>
            <p className="text-slate-500 text-[11px]">
              Run <code>installMonthlyInterestTrigger()</code> to automate the 25-day interest posting.
            </p>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-900 text-slate-200 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="bg-slate-950 p-3.5 flex items-center justify-between border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="font-mono font-semibold text-slate-300">Code.gs (Google Apps Script)</span>
          </div>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 text-[11px] font-semibold transition-colors"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300 select-all">
          <pre>{appScriptCode}</pre>
        </div>
      </div>
    </div>
  );
};
