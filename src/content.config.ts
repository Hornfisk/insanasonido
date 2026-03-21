import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const httpUrl = z.string().url().refine(
  (url) => url.startsWith('http://') || url.startsWith('https://'),
  { message: 'URL must use http or https protocol' }
);

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: ({ image }) => z.object({
    lang: z.enum(['es', 'en']).default('en'),
    title: z.string(),
    urlSlug: z.string(),
    date: z.coerce.date(),
    startTime: z.string(),
    endTime: z.string(),
    venue: z.string(),
    ticketUrl: httpUrl,
    coverImage: image(),
    logoImage: image().optional(),
    status: z.enum(['upcoming', 'past']),
    genres: z.string().array(),
    organizers: z.array(z.object({ name: z.string(), url: httpUrl })),
    ticketTiers: z.array(z.object({ name: z.string(), price: z.string() })),
    lineup: z.array(z.object({
      name: z.string(),
      image: image(),
      genres: z.string().array(),
      socialUrl: httpUrl,
      booked: z.boolean(),
    })),
    gallery: z.array(image()),
    description: z.string().optional(),
    ticketButtonLabel: z.string().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    lang: z.enum(['es', 'en']).default('en'),
    title: z.string(),
    urlSlug: z.string(),
    publishDate: z.coerce.date(),
    excerpt: z.string(),
    coverImage: image(),
  }),
});

export const collections = { events, blog };
