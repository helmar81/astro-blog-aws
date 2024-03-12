import { c as createAstro, d as createComponent, r as renderTemplate, g as renderComponent, m as maybeRenderHead } from '../astro_BOiJvXe6.mjs';
import 'kleur/colors';
import { $ as $$BlogPost } from './__B1I0iW7R.mjs';

const $$Astro = createAstro();
const $$About = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$About;
  return renderTemplate`${renderComponent($$result, "Layout", $$BlogPost, { "title": "About Me", "description": "Lorem ipsum dolor sit amet", "pubDate": /* @__PURE__ */ new Date("August 08 2021") }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div> <img src="/helmarbaechle.webp" alt="Avatar" class="avatar"> </div> <p class="text-2xl my-9 text-justify antialiased 
aspect-auto">As a Level 3 Support associate for Amazon, I excel at handling complex queries and escalated issues from our premium sellers. 
  In my spare time, I am passionate about staying up-to-date on the latest technologies and enjoy building apps with Astro.js. 
  With a love for travel, I have visited 63 countries and bring a diverse perspective to my work. Whether at home or abroad, 
  I am always seeking new challenges and opportunities to grow.</p> <div class="embed-responsive aspect-ratio-4/3"> <iframe class="justify bg-center" width="600" height="400" src="https://www.youtube.com/embed/_5dDrGtW7Wk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe> </div> ` })}`;
}, "C:/Users/User/astro-blog-latest/src/pages/about.astro", void 0);

const $$file = "C:/Users/User/astro-blog-latest/src/pages/about.astro";
const $$url = "/about";

export { $$About as default, $$file as file, $$url as url };
//# sourceMappingURL=about_B3sdOvmp.mjs.map
