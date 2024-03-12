---
title: 'Astro.js'
description: 'Here is a sample of some basic Markdown syntax that can be used when writing Markdown content in Astro.'
pubDate: 'Jul 01 2022'
heroImage: '/social.webp'
---

Build fast, content-focused websites


Astro is a static site builder designed to make it easy to create fast, content-focused websites. With Astro, you can use your favorite framework, such as React, Svelte, or Vue, to build your site and get lightning-fast performance. Astro also supports features like TypeScript, Scoped CSS, and Sass, and comes with built-in support for SEO and syndication through features like automatic sitemaps, RSS feeds, and pagination. Additionally, Astro can automatically hydrate interactive components on demand, so your users only load the content they need. Whether you're looking to build a simple blog or a complex web application, Astro has you covered.


### Prerequisites

- Node.js - v18.14.1 or higher.
- Text editor - recommended VS Code with the Official Astro extension
- Terminal - Astro is accessed through its command-line interface (CLI)


### Getting Started

Starting a new project in Astro is easy:

```shell
# create a new project with npm
npm create astro@latest
cd new-project-directory


# install your dependencies
npm install

# start the dev server and open your browser
npm run dev
```



### How Astro Works

Astro is a static site generator that allows you to build websites using your favorite JavaScript web framework, such as React, Svelte, or Vue. It generates static HTML during the build process, resulting in a fully static website with no JavaScript on the final page. However, Astro also allows you to add client-side JavaScript when needed, such as for interactive components like image carousels or shopping carts. These components are only loaded when needed, and the rest of the site remains as lightweight, static HTML. This means that you can have the best of both worlds: fast, static HTML for most of your site, and the ability to add interactive components when needed. Astro also has built-in support for partial hydration and the ability to defer loading of components until they become visible on the page, making it easy to optimize your site for performance.