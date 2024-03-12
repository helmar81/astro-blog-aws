import { c as createAstro, d as createComponent, r as renderTemplate, g as renderComponent, h as renderHead, e as addAttribute, m as maybeRenderHead } from '../astro_BOiJvXe6.mjs';
import 'kleur/colors';
import { g as getCollection, a as $$FormattedDate, b as $$BaseHead, c as $$Header, d as $$Footer, S as SITE_TITLE, e as SITE_DESCRIPTION, $ as $$BlogPost } from './__B1I0iW7R.mjs';
import 'clsx';
/* empty css                          */

const $$Astro$2 = createAstro();
const $$Index$1 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Index$1;
  const posts = (await getCollection("blog")).sort(
    (a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf()
  );
  return renderTemplate`<html lang="en"> <head>${renderComponent($$result, "BaseHead", $$BaseHead, { "title": SITE_TITLE, "description": SITE_DESCRIPTION })}${renderHead()}</head> <body> ${renderComponent($$result, "Header", $$Header, {})} <main> <section> <ul> ${posts.map((post) => renderTemplate`<li> <a${addAttribute(`/blog/${post.slug}/`, "href")}> <img${addAttribute(720, "width")}${addAttribute(360, "height")}${addAttribute(post.data.heroImage, "src")} alt=""> <h4 class="title">${post.data.title}</h4> <p class="date"> ${renderComponent($$result, "FormattedDate", $$FormattedDate, { "date": post.data.pubDate })} </p> </a> </li>`)} </ul> </section> </main> ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "C:/Users/User/astro-blog-latest/src/pages/blog/index.astro", void 0);

const $$file$1 = "C:/Users/User/astro-blog-latest/src/pages/blog/index.astro";
const $$url$1 = "/blog";

const index$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index$1,
	file: $$file$1,
	url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro$1 = createAstro();
const $$ViewTransitions = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$ViewTransitions;
  const { fallback = "animate" } = Astro2.props;
  return renderTemplate`<meta name="astro-view-transitions-enabled" content="true"><meta name="astro-view-transitions-fallback"${addAttribute(fallback, "content")}>`;
}, "C:/Users/User/astro-blog-latest/node_modules/astro/components/ViewTransitions.astro", void 0);

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`${renderComponent($$result, "Layout", $$BlogPost, { "title": "U S P E K H I", "description": "Webdesign", "pubDate": /* @__PURE__ */ new Date(), "heroImage": "/Uspekhi.png", "lang": "en" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ViewTransitions", $$ViewTransitions, {})} ${renderComponent($$result2, "BaseHead", $$BaseHead, { "title": SITE_TITLE, "description": SITE_DESCRIPTION })} ${maybeRenderHead()}<main> <h1 class="font-serif text-xl my-8 text-justify antialiased">If you're a business owner in 2023 or just a blogger and you're not satisfied with your website's performance, 
				these articles might be for you. Maybe you've invested a lot of time and effort into creating a beautiful website with a tool 
				like Wordpress or Wix, but it's not generating the results you hoped for. Even if you are getting some traction, 
				there is always room for improvement. In this blog, I'll explain why using a Framwork like React, Ionic, Svelte or Astro 
				is the best choice for building a strong web presence. As the backend you can either use Firebase powered by Google or AWS from Amazon.
</h1> </main> ` })}`;
}, "C:/Users/User/astro-blog-latest/src/pages/index.astro", void 0);

const $$file = "C:/Users/User/astro-blog-latest/src/pages/index.astro";
const $$url = "";

const index = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { index as a, index$1 as i };
//# sourceMappingURL=index_DQjLSf8k.mjs.map
