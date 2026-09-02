import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  AlertCircle,
  Copy,
  Receipt,
  Zap,
  Loader2,
} from 'lucide-react';
import { LedgerAccount, Member, Loan, Voucher } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  ledgers: LedgerAccount[];
  members: Member[];
  loans: Loan[];
  vouchers: Voucher[];
  onApplyAiVoucher?: (voucherData: any) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  voucherJson?: any;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  ledgers,
  members,
  loans,
  vouchers,
  onApplyAiVoucher,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am **Sathi AI**, your intelligent cooperative accounting copilot for "Sathi Sajilo Hisab".\n\nI can help you with:\n- **Drafting Double-Entry Vouchers** from plain English text (e.g., *"Received 25,000 saving from member"* or *"Paid 5,000 staff salary"*)\n- **25-Day Cycle Audits & Anomaly Checks**\n- **Meeting Agenda & Financial Summaries** for the 26th-end cycle\n- **Loan Amortization Queries**\n\nHow can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  if (!isOpen) return null;

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      // Build lightweight context for Gemini
      const context = {
        totalMembers: members.length,
        membersList: members.map((m) => ({ id: m.id, name: m.name, phone: m.phone })),
        activeLoansCount: loans.filter((l) => l.status === 'ACTIVE').length,
        totalDayBookVouchers: vouchers.length,
        summaryCash: ledgers.find((l) => l.code === '1101')?.currentBalance,
        summaryBank: ledgers.find((l) => l.code === '1102')?.currentBalance,
      };

      const res = await fetch('/api/ai/accounting-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend, context }),
      });

      const data = await res.json();
      const botReply = data.text || 'Received response from Sathi AI.';

      // Extract optional JSON block for voucher
      let voucherJson = null;
      const jsonMatch = botReply.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          voucherJson = JSON.parse(jsonMatch[1]);
        } catch {
          // Ignore parse errors if standard markdown
        }
      }

      const botMsg: Message = {
        role: 'assistant',
        content: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        voucherJson,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Failed to contact Sathi AI backend: ${err.message}. Please verify Gemini API key.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full h-[650px] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2 text-white">
                Sathi AI Accounting Copilot
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">
                  Gemini 2.5 Flash
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Cooperative accounting advisor for 25-day cycle & double-entry drafting
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* Quick Query Prompts */}
        <div className="bg-slate-50 p-2.5 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-500 font-bold whitespace-nowrap text-[10px] uppercase tracking-wider">Try asking:</span>
          <button
            onClick={() =>
              handleSendMessage(
                'Draft a receipt voucher for Suresh Sharma paying his monthly regular saving of Rs 25,000 in cash.'
              )
            }
            className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap font-medium transition-colors"
          >
            "Record 25k saving from Suresh"
          </button>
          <button
            onClick={() =>
              handleSendMessage(
                'Explain our 25-day monthly collection cycle rules and how Day 26-End meetings should be conducted.'
              )
            }
            className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap font-medium transition-colors"
          >
            "Explain 25-Day Cycle Rules"
          </button>
          <button
            onClick={() =>
              handleSendMessage(
                'Perform an audit check on our current financial health, cash balance, and staff salary status.'
              )
            }
            className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap font-medium transition-colors"
          >
            "Financial Audit Check"
          </button>
        </div>

        {/* Messages Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-slate-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-xl p-3.5 space-y-2 ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>

                {/* Optional Voucher Card if JSON detected */}
                {m.voucherJson && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-blue-200 space-y-2 text-slate-900">
                    <div className="flex items-center justify-between text-[11px] font-bold text-blue-700">
                      <span className="flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5" />
                        AI Drafted Voucher: {m.voucherJson.voucherType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">{m.voucherJson.narration}</div>
                    {onApplyAiVoucher && (
                      <button
                        onClick={() => onApplyAiVoucher(m.voucherJson)}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        Load Draft into Voucher Form
                      </button>
                    )}
                  </div>
                )}

                <div className={`text-[10px] text-right ${m.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                  {m.timestamp}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-slate-500 text-xs">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <span>Sathi AI is analyzing your accounting query...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask Sathi AI (e.g. 'Record 25k saving from Bikram in cash', 'Audit loan balances')..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
