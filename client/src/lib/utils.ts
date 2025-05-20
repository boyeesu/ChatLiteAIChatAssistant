import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date
export function formatDate(dateString: string | Date) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

// Format file size
export function formatFileSize(sizeKb: number) {
  if (sizeKb < 1024) {
    return `${sizeKb.toFixed(1)} KB`;
  }
  return `${(sizeKb / 1024).toFixed(1)} MB`;
}

// Get file icon by type
export function getFileIcon(fileType: string) {
  const iconMap: Record<string, string> = {
    pdf: 'file-text',
    docx: 'file-text',
    txt: 'file-text',
    html: 'code',
    // Add more mappings as needed
  };
  
  return iconMap[fileType.toLowerCase()] || 'file';
}

// Create a truncated text with ellipsis
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Generate a random session ID for chat
export function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Create debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
