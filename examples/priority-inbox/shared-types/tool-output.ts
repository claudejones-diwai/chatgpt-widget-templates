// Shared types for Priority Inbox tool output

export interface Email {
  id: string;
  sender: {
    name: string;
    email: string;
    avatar: string;
  };
  subject: string;
  preview: string;
  body: string;
  timestamp: string; // ISO 8601 format
  isRead: boolean;
  isStarred: boolean;
  priority: "high" | "normal" | "low";
  category: "primary" | "social" | "promotions" | "updates";
  hasAttachments?: boolean;
  labels?: string[];
}

export interface GetPriorityEmailsOutput {
  emails: Email[];
  category?: string;
  totalCount: number;
}
