// Shared types for animated testimonials widget
export interface Testimonial {
  quote: string;
  name: string;
  designation: string;
  src: string;
}

export interface AnimatedTestimonialsOutput {
  testimonials: Testimonial[];
  autoplay?: boolean;
  category?: string;
}
