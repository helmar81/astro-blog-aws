import { d as createComponent, r as renderTemplate, m as maybeRenderHead, u as unescapeHTML } from './astro_BOiJvXe6.mjs';
import 'kleur/colors';
import 'clsx';

const html = "<h4 id=\"one-code-for-all-android-ios-and-web\">one code for all: Android, IOS and Web</h4>\n<p>Step by step instruction, how to build a PWA\nCreate a progressive Web App with Ionic\nI am using Visual Code Studio from Microsoft. Make sure to have NodeJS installed.</p>\n<h3 id=\"start-with-a-template\">Start with a template</h3>\n<pre class=\"astro-code github-dark\" style=\"background-color:#24292e;color:#e1e4e8; overflow-x: auto;\" tabindex=\"0\"><code><span class=\"line\"><span>npm install -g ionic</span></span>\n<span class=\"line\"><span>ionic start myApp</span></span>\n<span class=\"line\"><span>cd myApp</span></span>\n<span class=\"line\"><span>ionic serve</span></span></code></pre>\n<h3 id=\"make-it-ready-for-production\">Make it ready for production</h3>\n<pre class=\"astro-code github-dark\" style=\"background-color:#24292e;color:#e1e4e8; overflow-x: auto;\" tabindex=\"0\"><code><span class=\"line\"><span>ng add @angular/pwa</span></span>\n<span class=\"line\"><span>ionic build --prod --service-worker</span></span>\n<span class=\"line\"><span>npm install -g firebase-tools</span></span>\n<span class=\"line\"><span>ionic serve</span></span></code></pre>\n<h3 id=\"certainly--you-want-to-make-your-app-accessible-for-everyone-on-the-internet\">Certainly , you want to make your App accessible for everyone on the internet</h3>\n<p>I am using Firebase for that  purpose</p>\n<pre class=\"astro-code github-dark\" style=\"background-color:#24292e;color:#e1e4e8; overflow-x: auto;\" tabindex=\"0\"><code><span class=\"line\"><span>ionic build --prod</span></span>\n<span class=\"line\"><span>firebase init</span></span>\n<span class=\"line\"><span>firebase serve (check before you deploy)</span></span>\n<span class=\"line\"><span>firebase deploy</span></span>\n<span class=\"line\"><span></span></span></code></pre>";

				const frontmatter = {"title":"Ionic","description":"Lorem ipsum dolor sit amet","pubDate":"Jul 22 2022","heroImage":"/biking.webp"};
				const file = "C:/Users/User/astro-blog-latest/src/content/blog/ionic.md";
				const url = undefined;
				function rawContent() {
					return "\n#### one code for all: Android, IOS and Web\n\nStep by step instruction, how to build a PWA\nCreate a progressive Web App with Ionic\nI am using Visual Code Studio from Microsoft. Make sure to have NodeJS installed.\n\n### Start with a template\n\n```\nnpm install -g ionic\nionic start myApp\ncd myApp\nionic serve\n```\n\n### Make it ready for production\n\n```\nng add @angular/pwa\nionic build --prod --service-worker\nnpm install -g firebase-tools\nionic serve\n```\n\n### Certainly , you want to make your App accessible for everyone on the internet\n\nI am using Firebase for that  purpose\n\n```\nionic build --prod\nfirebase init\nfirebase serve (check before you deploy)\nfirebase deploy\n\n```\n\n\n";
				}
				function compiledContent() {
					return html;
				}
				function getHeadings() {
					return [{"depth":4,"slug":"one-code-for-all-android-ios-and-web","text":"one code for all: Android, IOS and Web"},{"depth":3,"slug":"start-with-a-template","text":"Start with a template"},{"depth":3,"slug":"make-it-ready-for-production","text":"Make it ready for production"},{"depth":3,"slug":"certainly--you-want-to-make-your-app-accessible-for-everyone-on-the-internet","text":"Certainly , you want to make your App accessible for everyone on the internet"}];
				}

				const Content = createComponent((result, _props, slots) => {
					const { layout, ...content } = frontmatter;
					content.file = file;
					content.url = url;

					return renderTemplate`${maybeRenderHead()}${unescapeHTML(html)}`;
				});

export { Content, compiledContent, Content as default, file, frontmatter, getHeadings, rawContent, url };
//# sourceMappingURL=ionic_8-4-qJa3.mjs.map
