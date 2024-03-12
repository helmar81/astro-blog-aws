import { App } from "aws-cdk-lib/core";
import type { SSTConfig } from "sst";
import { AstroSite, Bucket } from "sst/constructs";
import { stack } from "sst/constructs/FunctionalStack.js";

export default {
  config(_input) {
    return {
      name: "astro-blog-latest",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const site = new AstroSite(stack, "site");
      stack.addOutputs({
        url: site.url,
      });
    });
  },
} satisfies SSTConfig;


