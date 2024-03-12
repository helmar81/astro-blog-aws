---
title: 'Svelte'
description: 'Lorem ipsum dolor sit amet'
pubDate: 'Jul 28 2022'
heroImage: '/global.webp'
---

Svelte is a rapidly growing front-end development framework that is designed for developer ergonomics and web best practices. It allows you to create fast and accessible websites. SvelteKit, the official back-end framework for Svelte, has also gained widespread adoption and recently reached version 1.0. Both Svelte and SvelteKit offer features such as components, scoped CSS, file-system based routing, and shortcuts for styling, reactivity, animations, and templating. These features make them strong contenders in the web development framework market.

At its core, Svelte is a code compiler. Whereas other frameworks like React and Vue.js generally add code to your web app to make it work in the user's browser, Svelte compiles the code that you write when you build your app. In doing so, it creates very small files and fast websites.

As a compiler, when you write Svelte, it looks a little strange. Here's an example of a .svelte file:

```go
<script>
  let name = 'world';
</script>

<h1>Hello {name}!</h1>
```

Svelte looks like HTML, with script and style tags included, but it also adds syntax to make your HTML dynamic — inside curly braces. All of this code gets transformed into vanilla HTML, CSS, and JavaScript with Svelte's compiler

SvelteKit is a back-end framework that provides infrastructure for hosting your Svelte app on a server. It offers features such as routing, layouts, static-site generation, API endpoints, and more. One of the standout features of SvelteKit is its fast hot reloading in development mode, which allows changes to appear almost instantly upon saving.