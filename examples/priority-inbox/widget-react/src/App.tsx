import { useState } from "react";
import {
  Mail,
  Star,
  Clock,
  ChevronDown,
  Archive,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import type { Email, GetPriorityEmailsOutput } from "../../shared-types/tool-output";
import { useToolData, useTheme } from "./hooks";

// Format timestamp to relative time (e.g., "2 hours ago")
function formatTimestamp(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  // Format as date for older emails
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Get priority badge styling
function getPriorityBadge(priority: Email["priority"]) {
  switch (priority) {
    case "high":
      return {
        icon: <AlertCircle className="h-3 w-3" />,
        className: "text-red-600 bg-red-50 ring-1 ring-red-200",
        label: "High",
      };
    case "low":
      return null; // Don't show badge for low priority
    default:
      return null; // Don't show badge for normal priority
  }
}

// Email row component
interface EmailRowProps {
  email: Email;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function EmailRow({ email, index, isExpanded, onToggleExpand }: EmailRowProps) {
  const priorityBadge = getPriorityBadge(email.priority);

  return (
    <div className="px-3 -mx-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div
        className="flex w-full items-start gap-2 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
      >
        {/* Left: Avatar + Number */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <img
            src={email.sender.avatar}
            alt={email.sender.name}
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-600"
          />
          <div className="w-4 text-center hidden sm:block text-sm text-gray-400 dark:text-gray-500 font-medium">
            {index + 1}
          </div>
        </div>

        {/* Middle: Email content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Sender name + badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`font-semibold text-sm ${
                    email.isRead ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {email.sender.name}
                </span>
                {priorityBadge && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium inline-flex items-center gap-0.5 ${priorityBadge.className}`}>
                    {priorityBadge.icon}
                    {priorityBadge.label}
                  </span>
                )}
                {!email.isRead && (
                  <span className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0"></span>
                )}
              </div>

              {/* Subject */}
              <div
                className={`text-sm mt-0.5 truncate ${
                  email.isRead ? "text-gray-600 dark:text-gray-400" : "text-gray-900 dark:text-gray-100 font-medium"
                }`}
              >
                {email.subject}
              </div>

              {/* Preview */}
              {!isExpanded && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {email.preview}
                </div>
              )}

              {/* Expanded body */}
              {isExpanded && (
                <div className="mt-3 text-sm text-left text-gray-700 dark:text-gray-300 whitespace-pre-line bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  {email.body}
                </div>
              )}

              {/* Metadata row */}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(email.timestamp)}
                </div>
                {email.hasAttachments && (
                  <div className="flex items-center gap-1">
                    <Paperclip className="h-3 w-3" />
                    Attachment
                  </div>
                )}
                <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">
                  {email.category}
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Star button */}
              <button
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  // Star functionality would go here
                }}
              >
                <Star
                  className={`h-4 w-4 ${
                    email.isStarred
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                />
              </button>

              {/* Expand button */}
              <button
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-transform"
                onClick={onToggleExpand}
              >
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  // Get emails from OpenAI skybridge using proper hooks
  const toolData = useToolData<GetPriorityEmailsOutput>();
  const theme = useTheme();
  const emails = toolData?.emails || [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Debug: log data to console
  console.log("Priority Inbox - toolData:", toolData);
  console.log("Priority Inbox - emails count:", emails.length);

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="antialiased w-full text-gray-900 dark:text-gray-100 px-4 pb-2 border border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-gray-800">
        <div className="max-w-full">
        {/* Header */}
        <div className="flex flex-row items-center gap-4 border-b border-gray-100 dark:border-gray-700 py-4">
          <div className="w-14 sm:w-16 aspect-square rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <Mail className="h-7 w-7 sm:h-8 sm:w-8 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="text-base sm:text-xl font-semibold">
              Priority Inbox
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {emails.length} {emails.length === 1 ? "message" : "messages"}
              {toolData?.category && toolData.category !== "all" && (
                <span className="text-gray-500">
                  {" "}• {toolData.category}
                </span>
              )}
            </div>
          </div>
          <div className="hidden sm:flex justify-end pr-2">
            <button
              type="button"
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
            >
              <Archive className="h-4 w-4" />
              Archive All
            </button>
          </div>
        </div>

        {/* Email list */}
        <div className="min-w-full text-sm flex flex-col">
          {emails.map((email, i) => (
            <EmailRow
              key={email.id}
              email={email}
              index={i}
              isExpanded={expandedId === email.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === email.id ? null : email.id)
              }
            />
          ))}

          {emails.length === 0 && (
            <div className="py-12 text-center">
              <Mail className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">No emails found</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Your inbox is empty or all messages have been archived
              </p>
            </div>
          )}
        </div>

        {/* Mobile archive button */}
        <div className="sm:hidden px-0 pt-3 pb-2">
          <button
            type="button"
            className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2.5 font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
          >
            <Archive className="h-4 w-4" />
            Archive All
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

export default App;
