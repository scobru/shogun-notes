export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  labels: string[];
  createdAt: number;
  updatedAt: number;
  archived?: boolean;
}

export const NOTE_COLORS = [
  '#ffffff', // white
  '#f28b82', // light red
  '#fbbc04', // yellow
  '#fff475', // light yellow
  '#ccff90', // light green
  '#a7ffeb', // light teal
  '#cbf0f8', // light blue
  '#aecbfa', // blue
  '#d7aefb', // purple
  '#fdcfe8', // pink
  '#e6c9a8', // brown
  '#e8eaed', // gray
] as const;

export type NoteColor = typeof NOTE_COLORS[number];

