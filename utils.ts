import React from 'react';
import { Part } from '@google/genai';

/**
 * Converts a File object to a GoogleGenAI.Part object for use with the Gemini API.
 * @param file The File object to convert.
 * @returns A Promise that resolves to a Part object.
 */
export const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

/**
 * Renders a string with simple markdown (**bold**) into React elements.
 * @param text The text to render.
 * @returns An array of React elements.
 */
// FIX: Rewrote the function to use React.createElement instead of JSX. This is necessary because this is a .ts file, not a .tsx file, and the TypeScript compiler was failing to parse the JSX syntax. This fix resolves the parsing errors in this file and the downstream type errors in components that consume this function.
export const renderMarkdown = (text: string = ''): React.ReactNode => {
  // Split by newlines first to create paragraphs
  return text.split('\n').map((paragraph, pIndex) => {
    if (paragraph.trim() === '') return null; // Don't render empty lines as paragraphs
    
    // Then, split by the bold delimiter to handle bold text
    const children = paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return React.createElement('strong', { key: i }, part.slice(2, -2));
      }
      return part;
    });
    
    return React.createElement('p', { key: pIndex, className: "mb-2 last:mb-0" }, ...children);
  });
};
