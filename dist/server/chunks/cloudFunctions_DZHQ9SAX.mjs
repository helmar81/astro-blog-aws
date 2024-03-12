import { d as createComponent, r as renderTemplate, m as maybeRenderHead, u as unescapeHTML } from './astro_BOiJvXe6.mjs';
import 'kleur/colors';
import 'clsx';

const html = "<p>working on it</p>";

				const frontmatter = {"title":"Cloud Functions","description":"Lorem ipsum dolor sit amet","pubDate":"Jul 15 2022","heroImage":"/introducing-astro.webp"};
				const file = "C:/Users/User/astro-blog-latest/src/content/blog/cloudFunctions.md";
				const url = undefined;
				function rawContent() {
					return "\nworking on it";
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
//# sourceMappingURL=cloudFunctions_DZHQ9SAX.mjs.map
