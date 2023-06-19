import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const generateFilename = (originalName: string): string => {
  const fileExtension = extname(originalName);
  const uniqueId = uuidv4();
  return `${uniqueId}${fileExtension}`;
};
