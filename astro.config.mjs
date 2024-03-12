import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';


import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'http://astro-aws2024.s3-website.eu-central-1.amazonaws.com/',
  integrations: [mdx(), sitemap(), tailwind()]
  
});

