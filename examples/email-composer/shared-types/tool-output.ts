// Type definitions for compose_email tool output

export interface ComposeEmailOutput {
  emailFrom: string;
  defaultTo: string;
  defaultSubject: string;
  defaultBody: string;
  templateType?: string; // Optional template identifier
}
