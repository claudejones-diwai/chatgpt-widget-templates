// Tool: get_priority_emails
import { mockEmails } from "../data/mock-emails";
import type { GetPriorityEmailsOutput } from "../../../shared-types/tool-output";

export function handleGetPriorityEmails(params: {
  category?: string;
  limit?: number;
  unreadOnly?: boolean;
}): GetPriorityEmailsOutput {
  const { category = "all", limit = 10, unreadOnly = false } = params;

  // Filter by category
  let filtered = mockEmails;

  if (category && category !== "all") {
    filtered = mockEmails.filter((email) => email.category === category);
  }

  // Filter by read status if requested
  if (unreadOnly) {
    filtered = filtered.filter((email) => !email.isRead);
  }

  // Sort by priority (high first) and then by timestamp (newest first)
  const priorityOrder = { high: 0, normal: 1, low: 2 };
  filtered.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Apply limit
  const emails = filtered.slice(0, limit);

  return {
    emails,
    category,
    totalCount: filtered.length,
  };
}
