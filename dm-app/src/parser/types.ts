export interface ListItem {
  id: string;
  title: string;
  content?: string;
  subItems?: ListItem[];
}

export interface List {
  id: string;
  name: string;
  items: ListItem[];
  createdAt: string; // ISO string format
  originalText?: string; // The original text input before splitting into items
}

export interface SavedBooklet extends List {
  savedAt: string;
} 