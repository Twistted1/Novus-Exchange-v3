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
    let cleanText = paragraph.trim();
    if (cleanText === '') return null; // Don't render empty lines as paragraphs
    
    // STRIP MARKDOWN SYMBOLS: No hashes, no leading bullets like '-', '*', etc.
    cleanText = cleanText
      .replace(/^#+\s*/, '') // Strip headers (hashes)
      .replace(/^[\*\-\+]\s+/, '') // Strip leading bullet symbols
      .replace(/(\*\*|__)(.*?)\1/g, '$2'); // Strip bold symbols but keep text
    
    return React.createElement('p', { key: pIndex, className: "mb-2 last:mb-0" }, cleanText);
  });
};
