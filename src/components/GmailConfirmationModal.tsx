import React, { useState } from 'react';
import { Mail, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { sendGmailEmail } from '../services/firebaseAuth';

interface GmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  subject: string;
  bodyText: string;
  onSuccess?: () => void;
}

export const GmailConfirmationModal: React.FC<GmailConfirmationModalProps> = ({
  isOpen,
  onClose,
  recipientEmail,
  subject,
  bodyText,
  onSuccess,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleConfirmSend = async () => {
    setIsSending(true);
    setResultMsg(null);
    try {
      const res = await sendGmailEmail(recipientEmail, subject, bodyText);
      if (res.success) {
        setResultMsg({ type: 'success', text: `Email sent successfully via Gmail API (ID: ${res.messageId})!` });
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      } else {
        setResultMsg({ type: 'error', text: res.error || 'Failed to send email' });
      }
    } catch (e: any) {
      setResultMsg({ type: 'error', text: e.message || 'Error executing Gmail send' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Confirm Sending Email via Gmail
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Google Workspace User Permission Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 space-y-3">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              WasteBot AI is requesting to send the following institutional notification from your authorized Gmail account on your behalf.
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 text-xs space-y-2 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="font-semibold text-slate-500 dark:text-slate-400">To:</span>{' '}
              <span className="text-slate-800 dark:text-slate-200 font-mono font-medium">{recipientEmail}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500 dark:text-slate-400">Subject:</span>{' '}
              <span className="text-slate-900 dark:text-white font-medium">{subject}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">Message Preview:</span>
              <pre className="text-[11px] text-slate-700 dark:text-slate-300 font-sans whitespace-pre-wrap max-h-36 overflow-y-auto bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                {bodyText}
              </pre>
            </div>
          </div>

          {resultMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                resultMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 border border-emerald-200'
                  : 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-200 border border-red-200'
              }`}
            >
              {resultMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{resultMsg.text}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmSend}
            disabled={isSending}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center space-x-2"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>Confirm & Send Email</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
