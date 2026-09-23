// A fixed list rather than free text: it makes filtering meaningful (no
// "Cleaning" vs "cleaning" vs "House Cleaning" fragmentation) and gives us
// a real <select> instead of an unbounded text field.
export const CATEGORIES = [
  "Home Repair",
  "Cleaning",
  "Tutoring",
  "Design",
  "Photography",
  "Fitness",
  "Landscaping",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
