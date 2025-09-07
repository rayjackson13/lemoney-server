import { isValid } from 'date-fns/isValid'

export const validateISOString = (text: string | null): boolean => !!text && isValid(new Date(text))
