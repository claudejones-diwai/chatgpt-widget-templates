// compose_email tool - Returns email template data
import type { ComposeEmailOutput } from "../../../shared-types/tool-output";

interface ComposeEmailArgs {
  to?: string;
  subject?: string;
  template?: "blank" | "meeting-followup" | "introduction" | "thank-you" | "roadmap-inquiry";
}

// Email templates
const templates = {
  blank: {
    subject: "",
    body: "",
  },
  "meeting-followup": {
    subject: "Following up on our meeting",
    body: `Hi there,\n\nIt was great meeting with you earlier. I wanted to follow up on a few points we discussed:\n\n1. [Point 1]\n2. [Point 2]\n3. [Point 3]\n\nLet me know your thoughts when you have a moment.\n\nBest regards`,
  },
  "introduction": {
    subject: "Introduction",
    body: `Hi [Name],\n\nI wanted to reach out and introduce myself. I'm [Your Name] from [Company], and I think there could be some great opportunities for us to collaborate.\n\nWould you be open to a quick call next week to discuss?\n\nLooking forward to connecting!\n\nBest`,
  },
  "thank-you": {
    subject: "Thank you",
    body: `Hi [Name],\n\nI just wanted to take a moment to say thank you for [specific reason]. Your help made a real difference and I truly appreciate it.\n\nLooking forward to working together again soon!\n\nBest regards`,
  },
  "roadmap-inquiry": {
    subject: "ChatKit Roadmap",
    body: `Hey David,\n\nHope you're doing well! Just wanted to check in and see if there are any updates on the ChatKit roadmap. We're excited to see what's coming next and how we can make the most of the upcoming features.\n\nEspecially curious to see how you support widgets!\n\nBest, Zach`,
  },
};

export function handleComposeEmail(args: ComposeEmailArgs): ComposeEmailOutput {
  // Default sender (in real app, would come from authenticated user)
  const emailFrom = "zj@openai.com";

  // Get template
  const templateKey = args.template || "blank";
  const template = templates[templateKey] || templates.blank;

  // Use provided values or template defaults
  const defaultTo = args.to || "weedon@openai.com";
  const defaultSubject = args.subject || template.subject;
  const defaultBody = template.body;

  return {
    emailFrom,
    defaultTo,
    defaultSubject,
    defaultBody,
    templateType: templateKey,
  };
}
