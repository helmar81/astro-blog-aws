import { d as createComponent, r as renderTemplate, m as maybeRenderHead, u as unescapeHTML } from './astro_BOiJvXe6.mjs';
import 'kleur/colors';
import 'clsx';

const html = "<p>Svelte is a rapidly growing front-end development framework that is designed for developer ergonomics and web best practices. It allows you to create fast and accessible websites. SvelteKit, the official back-end framework for Svelte, has also gained widespread adoption and recently reached version 1.0. Both Svelte and SvelteKit offer features such as components, scoped CSS, file-system based routing, and shortcuts for styling, reactivity, animations, and templating. These features make them strong contenders in the web development framework market.</p>\n<p>At its core, Svelte is a code compiler. Whereas other frameworks like React and Vue.js generally add code to your web app to make it work in the user’s browser, Svelte compiles the code that you write when you build your app. In doing so, it creates very small files and fast websites.</p>\n<p>As a compiler, when you write Svelte, it looks a little strange. Here’s an example of a .svelte file:</p>\n<pre class=\"astro-code github-dark\" style=\"background-color:#24292e;color:#e1e4e8; overflow-x: auto;\" tabindex=\"0\"><code><span class=\"line\"><span style=\"color:#F97583\">&#x3C;</span><span style=\"color:#E1E4E8\">script</span><span style=\"color:#F97583\">></span></span>\n<span class=\"line\"><span style=\"color:#E1E4E8\">  let name </span><span style=\"color:#F97583\">=</span><span style=\"color:#9ECBFF\"> '</span><span style=\"color:#FDAEB7;font-style:italic\">world</span><span style=\"color:#9ECBFF\">'</span><span style=\"color:#E1E4E8\">;</span></span>\n<span class=\"line\"><span style=\"color:#F97583\">&#x3C;/</span><span style=\"color:#E1E4E8\">script</span><span style=\"color:#F97583\">></span></span>\n<span class=\"line\"></span>\n<span class=\"line\"><span style=\"color:#F97583\">&#x3C;</span><span style=\"color:#E1E4E8\">h1</span><span style=\"color:#F97583\">></span><span style=\"color:#E1E4E8\">Hello {name}</span><span style=\"color:#F97583\">!&#x3C;/</span><span style=\"color:#E1E4E8\">h1</span><span style=\"color:#F97583\">></span></span></code></pre>\n<p>Svelte looks like HTML, with script and style tags included, but it also adds syntax to make your HTML dynamic — inside curly braces. All of this code gets transformed into vanilla HTML, CSS, and JavaScript with Svelte’s compiler</p>\n<p>SvelteKit is a back-end framework that provides infrastructure for hosting your Svelte app on a server. It offers features such as routing, layouts, static-site generation, API endpoints, and more. One of the standout features of SvelteKit is its fast hot reloading in development mode, which allows changes to appear almost instantly upon saving.</p>";

				const frontmatter = {"title":"Svelte","description":"Lorem ipsum dolor sit amet","pubDate":"Jul 28 2022","heroImage":"/global.webp"};
				const file = "C:/Users/User/astro-blog-latest/src/content/blog/svelte.md";
				const url = undefined;
				function rawContent() {
					return "\nSvelte is a rapidly growing front-end development framework that is designed for developer ergonomics and web best practices. It allows you to create fast and accessible websites. SvelteKit, the official back-end framework for Svelte, has also gained widespread adoption and recently reached version 1.0. Both Svelte and SvelteKit offer features such as components, scoped CSS, file-system based routing, and shortcuts for styling, reactivity, animations, and templating. These features make them strong contenders in the web development framework market.\n\nAt its core, Svelte is a code compiler. Whereas other frameworks like React and Vue.js generally add code to your web app to make it work in the user's browser, Svelte compiles the code that you write when you build your app. In doing so, it creates very small files and fast websites.\n\nAs a compiler, when you write Svelte, it looks a little strange. Here's an example of a .svelte file:\n\n```go\n<script>\n  let name = 'world';\n</script>\n\n<h1>Hello {name}!</h1>\n```\n\nSvelte looks like HTML, with script and style tags included, but it also adds syntax to make your HTML dynamic — inside curly braces. All of this code gets transformed into vanilla HTML, CSS, and JavaScript with Svelte's compiler\n\nSvelteKit is a back-end framework that provides infrastructure for hosting your Svelte app on a server. It offers features such as routing, layouts, static-site generation, API endpoints, and more. One of the standout features of SvelteKit is its fast hot reloading in development mode, which allows changes to appear almost instantly upon saving.";
				}
				function compiledContent() {
					return html;
				}
				function getHeadings() {
					return [];
				}

				const Content = createComponent((result, _props, slots) => {
					const { layout, ...content } = frontmatter;
					content.file = file;
					content.url = url;

					return renderTemplate`${maybeRenderHead()}${unescapeHTML(html)}`;
				});

export { Content, compiledContent, Content as default, file, frontmatter, getHeadings, rawContent, url };
//# sourceMappingURL=svelte_C6Hm0GHI.mjs.map
