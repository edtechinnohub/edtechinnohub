import { defineCollection, z } from 'astro:content';

// Books and Resources entries are created two ways:
// 1. Manually, by you, via the /admin CMS.
// 2. Automatically, by the Drive sync script (scripts/sync-drive.mjs), which
//    reads new files from your "EdTech InnoHub Website" Drive folders and
//    writes an entry here with driveSynced: true and a driveFileId, so the
//    sync script knows not to duplicate it next run.

const books = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string().optional(),
    description: z.string(),
    coverImage: z.string().optional(),
    fileUrl: z.string().url(),
    publishDate: z.date(),
    driveFileId: z.string().optional(),
    driveSynced: z.boolean().default(false),
  }),
});

const resources = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.enum([
      'Digital Skills',
      'Coding for Kids',
      'Teacher Development',
      'Webinar Recording',
      'Guide',
      'Other',
    ]),
    description: z.string(),
    fileUrl: z.string().url(),
    publishDate: z.date(),
    driveFileId: z.string().optional(),
    driveSynced: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    author: z.string().default('EdTech InnoHub Team'),
    coverImage: z.string().optional(),
    publishDate: z.date(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { books, resources, blog };
