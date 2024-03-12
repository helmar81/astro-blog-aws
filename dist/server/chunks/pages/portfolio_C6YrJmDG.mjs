import { c as createAstro, d as createComponent, r as renderTemplate, g as renderComponent, m as maybeRenderHead } from '../astro_BOiJvXe6.mjs';
import 'kleur/colors';
import { $ as $$BlogPost } from './__D0drNo3E.mjs';

const $$Astro = createAstro();
const $$Portfolio = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Portfolio;
  return renderTemplate`${renderComponent($$result, "Layout", $$BlogPost, { "title": "Portfolio", "pubDate": /* @__PURE__ */ new Date("March 05 2024"), "description": "multiple Apps created with different framwework" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<p class="text-justify antialiased">I've built various applications using frameworks like Angular, React, Astro, Svelte, and Ionic. I've deployed them on Firebase's free hosting service. 
         
         Currently I am exploring Amazon Web Services (AWS) for backend development.
</p> <div> <h2>My Resume / CV</h2> <p>created with Svelte and deployed on Firebase</p> <a href="https://helmarbachle.web.app/" rel="noopener" target="_blank"> <img src="/resume.png" alt="resume"> </a> </div> <div> <h2>Travel Blog</h2> <p>created with astro and deployed on Netlify</p> <a href="https://mytopcountries.web.app/" rel="noopener" target="_blank"> <img src="/travel.webp" alt="resume"> </a> </div> <div> <h2>Wellness Homes</h2> <p>created with astro and deployed on Netlify</p> <a href="https://wellness-homes.netlify.app/" rel="noopener" target="_blank"> <img src="/WellnessHomesLogo.png" alt="resume"> </a> </div> <div> <h2>Learning English</h2> <p>created with Ionic and deployed on Firebase</p> <a href="https://seeds-vungtau.firebaseapp.com/" rel="noopener" target="_blank"> <img src="/seeds.png" alt="resume"> </a> </div> <div> <h2>Come2Athens</h2> <p>created while I was working in Greece</p> <a href="https://come2athens.web.app/" rel="noopener" target="_blank"> <img src="/come2athens.png" alt="resume"> </a> </div> ` })}`;
}, "C:/Users/User/astro-blog-latest/src/pages/portfolio.astro", void 0);

const $$file = "C:/Users/User/astro-blog-latest/src/pages/portfolio.astro";
const $$url = "/portfolio";

export { $$Portfolio as default, $$file as file, $$url as url };
//# sourceMappingURL=portfolio_C6YrJmDG.mjs.map
