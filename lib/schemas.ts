import { z } from 'zod';
import { HUBS } from './geo';

const hubIds = HUBS.map((h) => h.id) as [string, ...string[]];

export const quoteSchema = z.object({
  mode: z.enum(['air', 'ocean', 'road']),
  cargo: z.string().min(2, 'Tell us what is moving, even roughly.'),
  weight: z.coerce.number({ invalid_type_error: 'Weight in kilograms, numbers only.' }).positive('Weight must be above zero.').max(2_000_000),
  pieces: z.coerce.number({ invalid_type_error: 'How many pieces?' }).int('Whole pieces only.').min(1, 'At least one piece.'),
  origin: z.enum(hubIds, { errorMap: () => ({ message: 'Choose where it starts.' }) }),
  destination: z.enum(hubIds, { errorMap: () => ({ message: 'Choose where it ends.' }) }),
  ready: z.string().min(1, 'When can we collect?'),
  name: z.string().min(2, 'We would like to know who to call.'),
  email: z.string().email('That email looks off.'),
  company: z.string().min(2, 'Company name, please.'),
  notes: z.string().max(1000).optional(),
}).refine((d) => d.origin !== d.destination, { path: ['destination'], message: 'Origin and destination must differ.' });

export type QuoteInput = z.infer<typeof quoteSchema>;

export const quoteSteps = [
  ['mode', 'cargo', 'weight', 'pieces'],
  ['origin', 'destination', 'ready'],
  ['name', 'email', 'company', 'notes'],
] as const;

export const contactSchema = z.object({
  name: z.string().min(2, 'We would like to know who to call.'),
  email: z.string().email('That email looks off.'),
  topic: z.enum(['quote', 'support', 'press', 'partnership', 'other'], { errorMap: () => ({ message: 'Pick a topic.' }) }),
  message: z.string().min(10, 'A sentence or two helps us route this.').max(2000),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({ email: z.string().email('That email looks off.') });

export const applySchema = z.object({
  jobId: z.string().min(1),
  name: z.string().min(2, 'Your name, please.'),
  email: z.string().email('That email looks off.'),
  link: z.string().url('Add a link to your CV or portfolio (https://…).'),
  note: z.string().max(1000).optional(),
});
export type ApplyInput = z.infer<typeof applySchema>;

export const trackIdSchema = z.string().trim().toUpperCase().regex(/^TA-\d{5}-[A-Z]{3}$/, 'Tracking IDs look like TA-48210-SIN.');
