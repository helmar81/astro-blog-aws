const id = "ionic.md";
						const collection = "blog";
						const slug = "ionic";
						const body = "\n#### one code for all: Android, IOS and Web\n\nStep by step instruction, how to build a PWA\nCreate a progressive Web App with Ionic\nI am using Visual Code Studio from Microsoft. Make sure to have NodeJS installed.\n\n### Start with a template\n\n```\nnpm install -g ionic\nionic start myApp\ncd myApp\nionic serve\n```\n\n### Make it ready for production\n\n```\nng add @angular/pwa\nionic build --prod --service-worker\nnpm install -g firebase-tools\nionic serve\n```\n\n### Certainly , you want to make your App accessible for everyone on the internet\n\nI am using Firebase for that  purpose\n\n```\nionic build --prod\nfirebase init\nfirebase serve (check before you deploy)\nfirebase deploy\n\n```\n\n\n";
						const data = {title:"Ionic",description:"Lorem ipsum dolor sit amet",pubDate:new Date(1658440800000),heroImage:"/biking.webp"};
						const _internal = {
							type: 'content',
							filePath: "C:/Users/User/astro-blog-latest/src/content/blog/ionic.md",
							rawData: undefined,
						};

export { _internal, body, collection, data, id, slug };
//# sourceMappingURL=ionic_BbV7bsYP.mjs.map
