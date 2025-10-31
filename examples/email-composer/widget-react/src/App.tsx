import { useState, useEffect } from "react";
import { Mail, Send, X } from "lucide-react";
import { useTheme, useToolData } from "./hooks";
import type { ComposeEmailOutput } from "../../shared-types/tool-output";

export default function App() {
  const theme = useTheme();
  const toolData = useToolData<ComposeEmailOutput>();

  // Email form state
  const [to, setTo] = useState(toolData?.defaultTo || "");
  const [subject, setSubject] = useState(toolData?.defaultSubject || "");
  const [body, setBody] = useState(toolData?.defaultBody || "");

  // Update form when toolData changes
  useEffect(() => {
    if (toolData) {
      setTo(toolData.defaultTo);
      setSubject(toolData.defaultSubject);
      setBody(toolData.defaultBody);
    }
  }, [toolData]);

  const handleSend = () => {
    // In a real app, this would trigger the email send action
    console.log("Send email:", { to, subject, body });
    alert(`Email would be sent to: ${to}`);
  };

  const handleDiscard = () => {
    // In a real app, this would trigger the discard action
    console.log("Discard email");
    if (confirm("Discard this draft?")) {
      setTo("");
      setSubject("");
      setBody("");
    }
  };

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {/* Email Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">Compose Email</h2>
                <p className="text-sm text-white/80">Draft and send your message</p>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* FROM Field (Read-only) */}
              <div className="flex items-start gap-3">
                <label className="w-20 text-xs font-semibold text-gray-500 dark:text-gray-400 pt-2">
                  FROM
                </label>
                <div className="flex-1 text-sm text-gray-600 dark:text-gray-400 pt-2">
                  {toolData?.emailFrom || "user@example.com"}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700" />

              {/* TO Field (Editable) */}
              <div className="flex items-start gap-3">
                <label className="w-20 text-xs font-semibold text-gray-500 dark:text-gray-400 pt-2">
                  TO
                </label>
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="name@example.com"
                  className="flex-1 px-0 py-2 text-sm text-gray-900 dark:text-gray-100 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700" />

              {/* SUBJECT Field (Editable) */}
              <div className="flex items-start gap-3">
                <label className="w-20 text-xs font-semibold text-gray-500 dark:text-gray-400 pt-2">
                  SUBJECT
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  className="flex-1 px-0 py-2 text-sm text-gray-900 dark:text-gray-100 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700" />

              {/* BODY Field (Editable, multiline) */}
              <div className="flex items-start gap-3">
                <label className="w-20 text-xs font-semibold text-gray-500 dark:text-gray-400 pt-2">
                  MESSAGE
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message…"
                  rows={9}
                  className="flex-1 px-0 py-2 text-sm text-gray-900 dark:text-gray-100 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex gap-3 justify-end bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={handleDiscard}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
                Discard
              </button>
              <button
                onClick={handleSend}
                disabled={!to || !subject || !body}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
                Send email
              </button>
            </div>
          </div>

          {/* Debug info (only shown in development) */}
          {import.meta.env.DEV && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
              <div className="font-mono text-gray-600 dark:text-gray-400">
                <div>Theme: {theme}</div>
                <div>Template: {toolData?.templateType || "none"}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
