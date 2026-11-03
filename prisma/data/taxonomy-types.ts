export interface QualDef { name: string; slug: string; level: number; types: string[]; branches: string[]; short?: string }

// Education types that may need creating (existing ones are reused by name).
export const NEW_TYPES = ['Veterinary', 'Design & Fine Arts', 'Physical Education', 'Library Science'];
