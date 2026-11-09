import bcrypt from 'bcryptjs';
// If signup uses a different library, change only this file.
export const hashPassword = (password: string) => bcrypt.hash(password, 12);
