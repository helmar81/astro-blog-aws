import { renderers } from './renderers.mjs';
import { l as levels, g as getEventPrefix, L as Logger, A as AstroIntegrationLogger, manifest } from './manifest_CRGFxotG.mjs';
import { appendForwardSlash, joinPaths, trimSlashes, slash, prependForwardSlash, removeTrailingForwardSlash, collapseDuplicateSlashes } from '@astrojs/internal-helpers/path';
import { A as AstroError, R as ResponseSentError, q as MiddlewareNoDataOrNextCalled, t as MiddlewareNotAResponse, v as ROUTE_TYPE_HEADER, G as GetStaticPathsRequired, w as InvalidGetStaticPathsReturn, x as InvalidGetStaticPathsEntry, y as GetStaticPathsExpectedParams, z as GetStaticPathsInvalidRouteParam, P as PageNumberParamNotFound, N as NoMatchingStaticPathFound, B as PrerenderDynamicEndpointPathCollide, C as ReservedSlotName, D as renderSlotToString, H as renderJSX, J as chunkToString, K as clientAddressSymbol$1, O as ClientAddressNotAvailable, S as StaticClientAddressNotAvailable, Q as responseSentSymbol$1, T as LocalsNotAnObject, V as clientLocalsSymbol, W as ASTRO_VERSION, X as renderEndpoint, Y as renderPage, Z as REROUTABLE_STATUS_CODES, _ as REROUTE_DIRECTIVE_HEADER } from './chunks/astro_BOiJvXe6.mjs';
import { serialize as serialize$1, parse } from 'cookie';
import 'clsx';
import 'kleur/colors';
import { performance } from 'node:perf_hooks';
import { webcrypto } from 'node:crypto';
import { ByteLengthQueuingStrategy, CountQueuingStrategy, ReadableByteStreamController, ReadableStream, ReadableStreamBYOBReader, ReadableStreamBYOBRequest, ReadableStreamDefaultController, ReadableStreamDefaultReader, TransformStream, WritableStream, WritableStreamDefaultController, WritableStreamDefaultWriter } from 'node:stream/web';
import { File, FormData, Headers as Headers$1, Request as Request$1, Response as Response$1, fetch as fetch$1 } from 'undici';
import { setTimeout as setTimeout$1, clearTimeout as clearTimeout$1 } from 'node:timers';
import { parse as parse$1, splitCookiesString } from 'set-cookie-parser';
import zlib from 'zlib';
import { onRequest } from './_noop-middleware.mjs';

function shouldAppendForwardSlash(trailingSlash, buildFormat) {
  switch (trailingSlash) {
    case "always":
      return true;
    case "never":
      return false;
    case "ignore": {
      switch (buildFormat) {
        case "directory":
          return true;
        case "preserve":
        case "file":
          return false;
      }
    }
  }
}

function getPathByLocale(locale, locales) {
  for (const loopLocale of locales) {
    if (typeof loopLocale === "string") {
      if (loopLocale === locale) {
        return loopLocale;
      }
    } else {
      for (const code of loopLocale.codes) {
        if (code === locale) {
          return loopLocale.path;
        }
      }
    }
  }
  throw new Unreachable();
}
function normalizeTheLocale(locale) {
  return locale.replaceAll("_", "-").toLowerCase();
}
function toCodes(locales) {
  return locales.map((loopLocale) => {
    if (typeof loopLocale === "string") {
      return loopLocale;
    } else {
      return loopLocale.codes[0];
    }
  });
}
class Unreachable extends Error {
  constructor() {
    super(
      "Astro encountered an unexpected line of code.\nIn most cases, this is not your fault, but a bug in astro code.\nIf there isn't one already, please create an issue.\nhttps://astro.build/issues"
    );
  }
}

const DELETED_EXPIRATION = /* @__PURE__ */ new Date(0);
const DELETED_VALUE = "deleted";
const responseSentSymbol = Symbol.for("astro.responseSent");
class AstroCookie {
  constructor(value) {
    this.value = value;
  }
  json() {
    if (this.value === void 0) {
      throw new Error(`Cannot convert undefined to an object.`);
    }
    return JSON.parse(this.value);
  }
  number() {
    return Number(this.value);
  }
  boolean() {
    if (this.value === "false")
      return false;
    if (this.value === "0")
      return false;
    return Boolean(this.value);
  }
}
class AstroCookies {
  #request;
  #requestValues;
  #outgoing;
  #consumed;
  constructor(request) {
    this.#request = request;
    this.#requestValues = null;
    this.#outgoing = null;
    this.#consumed = false;
  }
  /**
   * Astro.cookies.delete(key) is used to delete a cookie. Using this method will result
   * in a Set-Cookie header added to the response.
   * @param key The cookie to delete
   * @param options Options related to this deletion, such as the path of the cookie.
   */
  delete(key, options) {
    const serializeOptions = {
      expires: DELETED_EXPIRATION
    };
    if (options?.domain) {
      serializeOptions.domain = options.domain;
    }
    if (options?.path) {
      serializeOptions.path = options.path;
    }
    this.#ensureOutgoingMap().set(key, [
      DELETED_VALUE,
      serialize$1(key, DELETED_VALUE, serializeOptions),
      false
    ]);
  }
  /**
   * Astro.cookies.get(key) is used to get a cookie value. The cookie value is read from the
   * request. If you have set a cookie via Astro.cookies.set(key, value), the value will be taken
   * from that set call, overriding any values already part of the request.
   * @param key The cookie to get.
   * @returns An object containing the cookie value as well as convenience methods for converting its value.
   */
  get(key, options = void 0) {
    if (this.#outgoing?.has(key)) {
      let [serializedValue, , isSetValue] = this.#outgoing.get(key);
      if (isSetValue) {
        return new AstroCookie(serializedValue);
      } else {
        return void 0;
      }
    }
    const values = this.#ensureParsed(options);
    if (key in values) {
      const value = values[key];
      return new AstroCookie(value);
    }
  }
  /**
   * Astro.cookies.has(key) returns a boolean indicating whether this cookie is either
   * part of the initial request or set via Astro.cookies.set(key)
   * @param key The cookie to check for.
   * @returns
   */
  has(key, options = void 0) {
    if (this.#outgoing?.has(key)) {
      let [, , isSetValue] = this.#outgoing.get(key);
      return isSetValue;
    }
    const values = this.#ensureParsed(options);
    return !!values[key];
  }
  /**
   * Astro.cookies.set(key, value) is used to set a cookie's value. If provided
   * an object it will be stringified via JSON.stringify(value). Additionally you
   * can provide options customizing how this cookie will be set, such as setting httpOnly
   * in order to prevent the cookie from being read in client-side JavaScript.
   * @param key The name of the cookie to set.
   * @param value A value, either a string or other primitive or an object.
   * @param options Options for the cookie, such as the path and security settings.
   */
  set(key, value, options) {
    if (this.#consumed) {
      const warning = new Error(
        "Astro.cookies.set() was called after the cookies had already been sent to the browser.\nThis may have happened if this method was called in an imported component.\nPlease make sure that Astro.cookies.set() is only called in the frontmatter of the main page."
      );
      warning.name = "Warning";
      console.warn(warning);
    }
    let serializedValue;
    if (typeof value === "string") {
      serializedValue = value;
    } else {
      let toStringValue = value.toString();
      if (toStringValue === Object.prototype.toString.call(value)) {
        serializedValue = JSON.stringify(value);
      } else {
        serializedValue = toStringValue;
      }
    }
    const serializeOptions = {};
    if (options) {
      Object.assign(serializeOptions, options);
    }
    this.#ensureOutgoingMap().set(key, [
      serializedValue,
      serialize$1(key, serializedValue, serializeOptions),
      true
    ]);
    if (this.#request[responseSentSymbol]) {
      throw new AstroError({
        ...ResponseSentError
      });
    }
  }
  /**
   * Astro.cookies.header() returns an iterator for the cookies that have previously
   * been set by either Astro.cookies.set() or Astro.cookies.delete().
   * This method is primarily used by adapters to set the header on outgoing responses.
   * @returns
   */
  *headers() {
    if (this.#outgoing == null)
      return;
    for (const [, value] of this.#outgoing) {
      yield value[1];
    }
  }
  /**
   * Behaves the same as AstroCookies.prototype.headers(),
   * but allows a warning when cookies are set after the instance is consumed.
   */
  static consume(cookies) {
    cookies.#consumed = true;
    return cookies.headers();
  }
  #ensureParsed(options = void 0) {
    if (!this.#requestValues) {
      this.#parse(options);
    }
    if (!this.#requestValues) {
      this.#requestValues = {};
    }
    return this.#requestValues;
  }
  #ensureOutgoingMap() {
    if (!this.#outgoing) {
      this.#outgoing = /* @__PURE__ */ new Map();
    }
    return this.#outgoing;
  }
  #parse(options = void 0) {
    const raw = this.#request.headers.get("cookie");
    if (!raw) {
      return;
    }
    this.#requestValues = parse(raw, options);
  }
}

const astroCookiesSymbol = Symbol.for("astro.cookies");
function attachCookiesToResponse(response, cookies) {
  Reflect.set(response, astroCookiesSymbol, cookies);
}
function getFromResponse(response) {
  let cookies = Reflect.get(response, astroCookiesSymbol);
  if (cookies != null) {
    return cookies;
  } else {
    return void 0;
  }
}
function* getSetCookiesFromResponse(response) {
  const cookies = getFromResponse(response);
  if (!cookies) {
    return [];
  }
  for (const headerValue of AstroCookies.consume(cookies)) {
    yield headerValue;
  }
  return [];
}

const consoleLogDestination = {
  write(event) {
    let dest = console.error;
    if (levels[event.level] < levels["error"]) {
      dest = console.log;
    }
    if (event.label === "SKIP_FORMAT") {
      dest(event.message);
    } else {
      dest(getEventPrefix(event) + " " + event.message);
    }
    return true;
  }
};

const RedirectComponentInstance = {
  default() {
    return new Response(null, {
      status: 301
    });
  }
};
const RedirectSinglePageBuiltModule = {
  page: () => Promise.resolve(RedirectComponentInstance),
  onRequest: (_, next) => next(),
  renderers: []
};

function routeIsRedirect(route) {
  return route?.type === "redirect";
}
function routeIsFallback(route) {
  return route?.type === "fallback";
}

async function renderRedirect(renderContext) {
  const {
    request: { method },
    routeData
  } = renderContext;
  const { redirect, redirectRoute } = routeData;
  const status = redirectRoute && typeof redirect === "object" ? redirect.status : method === "GET" ? 301 : 308;
  const headers = { location: redirectRouteGenerate(renderContext) };
  return new Response(null, { status, headers });
}
function redirectRouteGenerate(renderContext) {
  const {
    params,
    routeData: { redirect, redirectRoute }
  } = renderContext;
  if (typeof redirectRoute !== "undefined") {
    return redirectRoute?.generate(params) || redirectRoute?.pathname || "/";
  } else if (typeof redirect === "string") {
    let target = redirect;
    for (const param of Object.keys(params)) {
      const paramValue = params[param];
      target = target.replace(`[${param}]`, paramValue);
      target = target.replace(`[...${param}]`, paramValue);
    }
    return target;
  } else if (typeof redirect === "undefined") {
    return "/";
  }
  return redirect.destination;
}

function parseLocale(header) {
  if (header === "*") {
    return [{ locale: header, qualityValue: void 0 }];
  }
  const result = [];
  const localeValues = header.split(",").map((str) => str.trim());
  for (const localeValue of localeValues) {
    const split = localeValue.split(";").map((str) => str.trim());
    const localeName = split[0];
    const qualityValue = split[1];
    if (!split) {
      continue;
    }
    if (qualityValue && qualityValue.startsWith("q=")) {
      const qualityValueAsFloat = Number.parseFloat(qualityValue.slice("q=".length));
      if (Number.isNaN(qualityValueAsFloat) || qualityValueAsFloat > 1) {
        result.push({
          locale: localeName,
          qualityValue: void 0
        });
      } else {
        result.push({
          locale: localeName,
          qualityValue: qualityValueAsFloat
        });
      }
    } else {
      result.push({
        locale: localeName,
        qualityValue: void 0
      });
    }
  }
  return result;
}
function sortAndFilterLocales(browserLocaleList, locales) {
  const normalizedLocales = toCodes(locales).map(normalizeTheLocale);
  return browserLocaleList.filter((browserLocale) => {
    if (browserLocale.locale !== "*") {
      return normalizedLocales.includes(normalizeTheLocale(browserLocale.locale));
    }
    return true;
  }).sort((a, b) => {
    if (a.qualityValue && b.qualityValue) {
      if (a.qualityValue > b.qualityValue) {
        return -1;
      } else if (a.qualityValue < b.qualityValue) {
        return 1;
      }
    }
    return 0;
  });
}
function computePreferredLocale(request, locales) {
  const acceptHeader = request.headers.get("Accept-Language");
  let result = void 0;
  if (acceptHeader) {
    const browserLocaleList = sortAndFilterLocales(parseLocale(acceptHeader), locales);
    const firstResult = browserLocaleList.at(0);
    if (firstResult && firstResult.locale !== "*") {
      for (const currentLocale of locales) {
        if (typeof currentLocale === "string") {
          if (normalizeTheLocale(currentLocale) === normalizeTheLocale(firstResult.locale)) {
            result = currentLocale;
          }
        } else {
          for (const currentCode of currentLocale.codes) {
            if (normalizeTheLocale(currentCode) === normalizeTheLocale(firstResult.locale)) {
              result = currentLocale.path;
            }
          }
        }
      }
    }
  }
  return result;
}
function computePreferredLocaleList(request, locales) {
  const acceptHeader = request.headers.get("Accept-Language");
  let result = [];
  if (acceptHeader) {
    const browserLocaleList = sortAndFilterLocales(parseLocale(acceptHeader), locales);
    if (browserLocaleList.length === 1 && browserLocaleList.at(0).locale === "*") {
      return locales.map((locale) => {
        if (typeof locale === "string") {
          return locale;
        } else {
          return locale.codes.at(0);
        }
      });
    } else if (browserLocaleList.length > 0) {
      for (const browserLocale of browserLocaleList) {
        for (const loopLocale of locales) {
          if (typeof loopLocale === "string") {
            if (normalizeTheLocale(loopLocale) === normalizeTheLocale(browserLocale.locale)) {
              result.push(loopLocale);
            }
          } else {
            for (const code of loopLocale.codes) {
              if (code === browserLocale.locale) {
                result.push(loopLocale.path);
              }
            }
          }
        }
      }
    }
  }
  return result;
}
function computeCurrentLocale(pathname, locales, routingStrategy, defaultLocale) {
  for (const segment of pathname.split("/")) {
    for (const locale of locales) {
      if (typeof locale === "string") {
        if (!segment.includes(locale))
          continue;
        if (normalizeTheLocale(locale) === normalizeTheLocale(segment)) {
          return locale;
        }
      } else {
        if (locale.path === segment) {
          return locale.codes.at(0);
        } else {
          for (const code of locale.codes) {
            if (normalizeTheLocale(code) === normalizeTheLocale(segment)) {
              return code;
            }
          }
        }
      }
    }
  }
  if (routingStrategy === "pathname-prefix-other-locales" || routingStrategy === "domains-prefix-other-locales") {
    return defaultLocale;
  }
  return void 0;
}

async function callMiddleware(onRequest, apiContext, responseFunction) {
  let nextCalled = false;
  let responseFunctionPromise = void 0;
  const next = async () => {
    nextCalled = true;
    responseFunctionPromise = responseFunction();
    return responseFunctionPromise;
  };
  let middlewarePromise = onRequest(apiContext, next);
  return await Promise.resolve(middlewarePromise).then(async (value) => {
    if (nextCalled) {
      if (typeof value !== "undefined") {
        if (value instanceof Response === false) {
          throw new AstroError(MiddlewareNotAResponse);
        }
        return value;
      } else {
        if (responseFunctionPromise) {
          return responseFunctionPromise;
        } else {
          throw new AstroError(MiddlewareNotAResponse);
        }
      }
    } else if (typeof value === "undefined") {
      throw new AstroError(MiddlewareNoDataOrNextCalled);
    } else if (value instanceof Response === false) {
      throw new AstroError(MiddlewareNotAResponse);
    } else {
      return value;
    }
  });
}

function sequence(...handlers) {
  const filtered = handlers.filter((h) => !!h);
  const length = filtered.length;
  if (!length) {
    const handler = defineMiddleware((context, next) => {
      return next();
    });
    return handler;
  }
  return defineMiddleware((context, next) => {
    return applyHandle(0, context);
    function applyHandle(i, handleContext) {
      const handle = filtered[i];
      const result = handle(handleContext, async () => {
        if (i < length - 1) {
          return applyHandle(i + 1, handleContext);
        } else {
          return next();
        }
      });
      return result;
    }
  });
}

function defineMiddleware(fn) {
  return fn;
}

function pathnameHasLocale(pathname, locales) {
  const segments = pathname.split("/");
  for (const segment of segments) {
    for (const locale of locales) {
      if (typeof locale === "string") {
        if (normalizeTheLocale(segment) === normalizeTheLocale(locale)) {
          return true;
        }
      } else if (segment === locale.path) {
        return true;
      }
    }
  }
  return false;
}
function createI18nMiddleware(i18n, base, trailingSlash, buildFormat) {
  if (!i18n)
    return (_, next) => next();
  const prefixAlways = (url, response, context) => {
    if (url.pathname === base + "/" || url.pathname === base) {
      if (shouldAppendForwardSlash(trailingSlash, buildFormat)) {
        return context.redirect(`${appendForwardSlash(joinPaths(base, i18n.defaultLocale))}`);
      } else {
        return context.redirect(`${joinPaths(base, i18n.defaultLocale)}`);
      }
    } else if (!pathnameHasLocale(url.pathname, i18n.locales)) {
      return new Response(null, {
        status: 404,
        headers: response.headers
      });
    }
    return void 0;
  };
  const prefixOtherLocales = (url, response) => {
    let pathnameContainsDefaultLocale = false;
    for (const segment of url.pathname.split("/")) {
      if (normalizeTheLocale(segment) === normalizeTheLocale(i18n.defaultLocale)) {
        pathnameContainsDefaultLocale = true;
        break;
      }
    }
    if (pathnameContainsDefaultLocale) {
      const newLocation = url.pathname.replace(`/${i18n.defaultLocale}`, "");
      response.headers.set("Location", newLocation);
      return new Response(null, {
        status: 404,
        headers: response.headers
      });
    }
    return void 0;
  };
  const prefixAlwaysNoRedirect = (url, response) => {
    const isRoot = url.pathname === base + "/" || url.pathname === base;
    if (!(isRoot || pathnameHasLocale(url.pathname, i18n.locales))) {
      return new Response(null, {
        status: 404,
        headers: response.headers
      });
    }
    return void 0;
  };
  return async (context, next) => {
    const response = await next();
    const type = response.headers.get(ROUTE_TYPE_HEADER);
    if (type !== "page" && type !== "fallback") {
      return response;
    }
    const { url, currentLocale } = context;
    const { locales, defaultLocale, fallback, strategy } = i18n;
    switch (i18n.strategy) {
      case "domains-prefix-other-locales": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = prefixOtherLocales(url, response);
          if (result) {
            return result;
          }
        }
        break;
      }
      case "pathname-prefix-other-locales": {
        const result = prefixOtherLocales(url, response);
        if (result) {
          return result;
        }
        break;
      }
      case "domains-prefix-always-no-redirect": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = prefixAlwaysNoRedirect(url, response);
          if (result) {
            return result;
          }
        }
        break;
      }
      case "pathname-prefix-always-no-redirect": {
        const result = prefixAlwaysNoRedirect(url, response);
        if (result) {
          return result;
        }
        break;
      }
      case "pathname-prefix-always": {
        const result = prefixAlways(url, response, context);
        if (result) {
          return result;
        }
        break;
      }
      case "domains-prefix-always": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = prefixAlways(url, response, context);
          if (result) {
            return result;
          }
        }
        break;
      }
    }
    if (response.status >= 300 && fallback) {
      const fallbackKeys = i18n.fallback ? Object.keys(i18n.fallback) : [];
      const segments = url.pathname.split("/");
      const urlLocale = segments.find((segment) => {
        for (const locale of locales) {
          if (typeof locale === "string") {
            if (locale === segment) {
              return true;
            }
          } else if (locale.path === segment) {
            return true;
          }
        }
        return false;
      });
      if (urlLocale && fallbackKeys.includes(urlLocale)) {
        const fallbackLocale = fallback[urlLocale];
        const pathFallbackLocale = getPathByLocale(fallbackLocale, locales);
        let newPathname;
        if (pathFallbackLocale === defaultLocale && strategy === "pathname-prefix-other-locales") {
          newPathname = url.pathname.replace(`/${urlLocale}`, ``);
        } else {
          newPathname = url.pathname.replace(`/${urlLocale}`, `/${pathFallbackLocale}`);
        }
        return context.redirect(newPathname);
      }
    }
    return response;
  };
}
function localeHasntDomain(i18n, currentLocale) {
  for (const domainLocale of Object.values(i18n.domainLookupTable)) {
    if (domainLocale === currentLocale) {
      return false;
    }
  }
  return true;
}

const VALID_PARAM_TYPES = ["string", "number", "undefined"];
function validateGetStaticPathsParameter([key, value], route) {
  if (!VALID_PARAM_TYPES.includes(typeof value)) {
    throw new AstroError({
      ...GetStaticPathsInvalidRouteParam,
      message: GetStaticPathsInvalidRouteParam.message(key, value, typeof value),
      location: {
        file: route
      }
    });
  }
}
function validateDynamicRouteModule(mod, {
  ssr,
  route
}) {
  if ((!ssr || route.prerender) && !mod.getStaticPaths) {
    throw new AstroError({
      ...GetStaticPathsRequired,
      location: { file: route.component }
    });
  }
}
function validateGetStaticPathsResult(result, logger, route) {
  if (!Array.isArray(result)) {
    throw new AstroError({
      ...InvalidGetStaticPathsReturn,
      message: InvalidGetStaticPathsReturn.message(typeof result),
      location: {
        file: route.component
      }
    });
  }
  result.forEach((pathObject) => {
    if (typeof pathObject === "object" && Array.isArray(pathObject) || pathObject === null) {
      throw new AstroError({
        ...InvalidGetStaticPathsEntry,
        message: InvalidGetStaticPathsEntry.message(
          Array.isArray(pathObject) ? "array" : typeof pathObject
        )
      });
    }
    if (pathObject.params === void 0 || pathObject.params === null || pathObject.params && Object.keys(pathObject.params).length === 0) {
      throw new AstroError({
        ...GetStaticPathsExpectedParams,
        location: {
          file: route.component
        }
      });
    }
    for (const [key, val] of Object.entries(pathObject.params)) {
      if (!(typeof val === "undefined" || typeof val === "string" || typeof val === "number")) {
        logger.warn(
          "router",
          `getStaticPaths() returned an invalid path param: "${key}". A string, number or undefined value was expected, but got \`${JSON.stringify(
            val
          )}\`.`
        );
      }
      if (typeof val === "string" && val === "") {
        logger.warn(
          "router",
          `getStaticPaths() returned an invalid path param: "${key}". \`undefined\` expected for an optional param, but got empty string.`
        );
      }
    }
  });
}

function stringifyParams(params, route) {
  const validatedParams = Object.entries(params).reduce((acc, next) => {
    validateGetStaticPathsParameter(next, route.component);
    const [key, value] = next;
    if (value !== void 0) {
      acc[key] = typeof value === "string" ? trimSlashes(value) : value.toString();
    }
    return acc;
  }, {});
  return JSON.stringify(route.generate(validatedParams));
}

function generatePaginateFunction(routeMatch) {
  return function paginateUtility(data, args = {}) {
    let { pageSize: _pageSize, params: _params, props: _props } = args;
    const pageSize = _pageSize || 10;
    const paramName = "page";
    const additionalParams = _params || {};
    const additionalProps = _props || {};
    let includesFirstPageNumber;
    if (routeMatch.params.includes(`...${paramName}`)) {
      includesFirstPageNumber = false;
    } else if (routeMatch.params.includes(`${paramName}`)) {
      includesFirstPageNumber = true;
    } else {
      throw new AstroError({
        ...PageNumberParamNotFound,
        message: PageNumberParamNotFound.message(paramName)
      });
    }
    const lastPage = Math.max(1, Math.ceil(data.length / pageSize));
    const result = [...Array(lastPage).keys()].map((num) => {
      const pageNum = num + 1;
      const start = pageSize === Infinity ? 0 : (pageNum - 1) * pageSize;
      const end = Math.min(start + pageSize, data.length);
      const params = {
        ...additionalParams,
        [paramName]: includesFirstPageNumber || pageNum > 1 ? String(pageNum) : void 0
      };
      const current = correctIndexRoute(routeMatch.generate({ ...params }));
      const next = pageNum === lastPage ? void 0 : correctIndexRoute(routeMatch.generate({ ...params, page: String(pageNum + 1) }));
      const prev = pageNum === 1 ? void 0 : correctIndexRoute(
        routeMatch.generate({
          ...params,
          page: !includesFirstPageNumber && pageNum - 1 === 1 ? void 0 : String(pageNum - 1)
        })
      );
      return {
        params,
        props: {
          ...additionalProps,
          page: {
            data: data.slice(start, end),
            start,
            end: end - 1,
            size: pageSize,
            total: data.length,
            currentPage: pageNum,
            lastPage,
            url: { current, next, prev }
          }
        }
      };
    });
    return result;
  };
}
function correctIndexRoute(route) {
  if (route === "") {
    return "/";
  }
  return route;
}

async function callGetStaticPaths({
  mod,
  route,
  routeCache,
  logger,
  ssr
}) {
  const cached = routeCache.get(route);
  if (!mod) {
    throw new Error("This is an error caused by Astro and not your code. Please file an issue.");
  }
  if (cached?.staticPaths) {
    return cached.staticPaths;
  }
  validateDynamicRouteModule(mod, { ssr, route });
  if (ssr && !route.prerender) {
    const entry = Object.assign([], { keyed: /* @__PURE__ */ new Map() });
    routeCache.set(route, { ...cached, staticPaths: entry });
    return entry;
  }
  let staticPaths = [];
  if (!mod.getStaticPaths) {
    throw new Error("Unexpected Error.");
  }
  staticPaths = await mod.getStaticPaths({
    // Q: Why the cast?
    // A: So users downstream can have nicer typings, we have to make some sacrifice in our internal typings, which necessitate a cast here
    paginate: generatePaginateFunction(route)
  });
  validateGetStaticPathsResult(staticPaths, logger, route);
  const keyedStaticPaths = staticPaths;
  keyedStaticPaths.keyed = /* @__PURE__ */ new Map();
  for (const sp of keyedStaticPaths) {
    const paramsKey = stringifyParams(sp.params, route);
    keyedStaticPaths.keyed.set(paramsKey, sp);
  }
  routeCache.set(route, { ...cached, staticPaths: keyedStaticPaths });
  return keyedStaticPaths;
}
class RouteCache {
  logger;
  cache = {};
  mode;
  constructor(logger, mode = "production") {
    this.logger = logger;
    this.mode = mode;
  }
  /** Clear the cache. */
  clearAll() {
    this.cache = {};
  }
  set(route, entry) {
    const key = this.key(route);
    if (this.mode === "production" && this.cache[key]?.staticPaths) {
      this.logger.warn(null, `Internal Warning: route cache overwritten. (${key})`);
    }
    this.cache[key] = entry;
  }
  get(route) {
    return this.cache[this.key(route)];
  }
  key(route) {
    return `${route.route}_${route.component}`;
  }
}
function findPathItemByKey(staticPaths, params, route, logger) {
  const paramsKey = stringifyParams(params, route);
  const matchedStaticPath = staticPaths.keyed.get(paramsKey);
  if (matchedStaticPath) {
    return matchedStaticPath;
  }
  logger.debug("router", `findPathItemByKey() - Unexpected cache miss looking for ${paramsKey}`);
}

class Pipeline {
  constructor(logger, manifest, mode, renderers, resolve, serverLike, streaming, adapterName = manifest.adapterName, clientDirectives = manifest.clientDirectives, compressHTML = manifest.compressHTML, i18n = manifest.i18n, middleware = manifest.middleware, routeCache = new RouteCache(logger, mode), site = manifest.site) {
    this.logger = logger;
    this.manifest = manifest;
    this.mode = mode;
    this.renderers = renderers;
    this.resolve = resolve;
    this.serverLike = serverLike;
    this.streaming = streaming;
    this.adapterName = adapterName;
    this.clientDirectives = clientDirectives;
    this.compressHTML = compressHTML;
    this.i18n = i18n;
    this.middleware = middleware;
    this.routeCache = routeCache;
    this.site = site;
    this.internalMiddleware = [
      createI18nMiddleware(i18n, manifest.base, manifest.trailingSlash, manifest.buildFormat)
    ];
  }
  internalMiddleware;
}

async function getProps(opts) {
  const { logger, mod, routeData: route, routeCache, pathname, serverLike } = opts;
  if (!route || route.pathname) {
    return {};
  }
  if (routeIsRedirect(route) || routeIsFallback(route)) {
    return {};
  }
  const params = getParams(route, pathname);
  if (mod) {
    validatePrerenderEndpointCollision(route, mod, params);
  }
  const staticPaths = await callGetStaticPaths({
    mod,
    route,
    routeCache,
    logger,
    ssr: serverLike
  });
  const matchedStaticPath = findPathItemByKey(staticPaths, params, route, logger);
  if (!matchedStaticPath && (serverLike ? route.prerender : true)) {
    throw new AstroError({
      ...NoMatchingStaticPathFound,
      message: NoMatchingStaticPathFound.message(pathname),
      hint: NoMatchingStaticPathFound.hint([route.component])
    });
  }
  const props = matchedStaticPath?.props ? { ...matchedStaticPath.props } : {};
  return props;
}
function getParams(route, pathname) {
  if (!route.params.length)
    return {};
  const paramsMatch = route.pattern.exec(decodeURIComponent(pathname));
  if (!paramsMatch)
    return {};
  const params = {};
  route.params.forEach((key, i) => {
    if (key.startsWith("...")) {
      params[key.slice(3)] = paramsMatch[i + 1] ? paramsMatch[i + 1] : void 0;
    } else {
      params[key] = paramsMatch[i + 1];
    }
  });
  return params;
}
function validatePrerenderEndpointCollision(route, mod, params) {
  if (route.type === "endpoint" && mod.getStaticPaths) {
    const lastSegment = route.segments[route.segments.length - 1];
    const paramValues = Object.values(params);
    const lastParam = paramValues[paramValues.length - 1];
    if (lastSegment.length === 1 && lastSegment[0].dynamic && lastParam === void 0) {
      throw new AstroError({
        ...PrerenderDynamicEndpointPathCollide,
        message: PrerenderDynamicEndpointPathCollide.message(route.route),
        hint: PrerenderDynamicEndpointPathCollide.hint(route.component),
        location: {
          file: route.component
        }
      });
    }
  }
}

function getFunctionExpression(slot) {
  if (!slot)
    return;
  if (slot.expressions?.length !== 1)
    return;
  return slot.expressions[0];
}
class Slots {
  #result;
  #slots;
  #logger;
  constructor(result, slots, logger) {
    this.#result = result;
    this.#slots = slots;
    this.#logger = logger;
    if (slots) {
      for (const key of Object.keys(slots)) {
        if (this[key] !== void 0) {
          throw new AstroError({
            ...ReservedSlotName,
            message: ReservedSlotName.message(key)
          });
        }
        Object.defineProperty(this, key, {
          get() {
            return true;
          },
          enumerable: true
        });
      }
    }
  }
  has(name) {
    if (!this.#slots)
      return false;
    return Boolean(this.#slots[name]);
  }
  async render(name, args = []) {
    if (!this.#slots || !this.has(name))
      return;
    const result = this.#result;
    if (!Array.isArray(args)) {
      this.#logger.warn(
        null,
        `Expected second parameter to be an array, received a ${typeof args}. If you're trying to pass an array as a single argument and getting unexpected results, make sure you're passing your array as a item of an array. Ex: Astro.slots.render('default', [["Hello", "World"]])`
      );
    } else if (args.length > 0) {
      const slotValue = this.#slots[name];
      const component = typeof slotValue === "function" ? await slotValue(result) : await slotValue;
      const expression = getFunctionExpression(component);
      if (expression) {
        const slot = async () => typeof expression === "function" ? expression(...args) : expression;
        return await renderSlotToString(result, slot).then((res) => {
          return res;
        });
      }
      if (typeof component === "function") {
        return await renderJSX(result, component(...args)).then(
          (res) => res != null ? String(res) : res
        );
      }
    }
    const content = await renderSlotToString(result, this.#slots[name]);
    const outHTML = chunkToString(result, content);
    return outHTML;
  }
}
function createResult(args) {
  const { params, request, resolve, locals } = args;
  const url = new URL(request.url);
  const headers = new Headers();
  headers.set("Content-Type", "text/html");
  const response = {
    status: args.status,
    statusText: "OK",
    headers
  };
  Object.defineProperty(response, "headers", {
    value: response.headers,
    enumerable: true,
    writable: false
  });
  let cookies = args.cookies;
  let preferredLocale = void 0;
  let preferredLocaleList = void 0;
  let currentLocale = void 0;
  const result = {
    styles: args.styles ?? /* @__PURE__ */ new Set(),
    scripts: args.scripts ?? /* @__PURE__ */ new Set(),
    links: args.links ?? /* @__PURE__ */ new Set(),
    componentMetadata: args.componentMetadata ?? /* @__PURE__ */ new Map(),
    renderers: args.renderers,
    clientDirectives: args.clientDirectives,
    compressHTML: args.compressHTML,
    partial: args.partial,
    pathname: args.pathname,
    cookies,
    /** This function returns the `Astro` faux-global */
    createAstro(astroGlobal, props, slots) {
      const astroSlots = new Slots(result, slots, args.logger);
      const Astro = {
        // @ts-expect-error
        __proto__: astroGlobal,
        get clientAddress() {
          if (!(clientAddressSymbol$1 in request)) {
            if (args.adapterName) {
              throw new AstroError({
                ...ClientAddressNotAvailable,
                message: ClientAddressNotAvailable.message(args.adapterName)
              });
            } else {
              throw new AstroError(StaticClientAddressNotAvailable);
            }
          }
          return Reflect.get(request, clientAddressSymbol$1);
        },
        get cookies() {
          if (cookies) {
            return cookies;
          }
          cookies = new AstroCookies(request);
          result.cookies = cookies;
          return cookies;
        },
        get preferredLocale() {
          if (preferredLocale) {
            return preferredLocale;
          }
          if (args.locales) {
            preferredLocale = computePreferredLocale(request, args.locales);
            return preferredLocale;
          }
          return void 0;
        },
        get preferredLocaleList() {
          if (preferredLocaleList) {
            return preferredLocaleList;
          }
          if (args.locales) {
            preferredLocaleList = computePreferredLocaleList(request, args.locales);
            return preferredLocaleList;
          }
          return void 0;
        },
        get currentLocale() {
          if (currentLocale) {
            return currentLocale;
          }
          if (args.locales) {
            currentLocale = computeCurrentLocale(
              url.pathname,
              args.locales,
              args.strategy,
              args.defaultLocale
            );
            if (currentLocale) {
              return currentLocale;
            }
          }
          return void 0;
        },
        params,
        props,
        locals,
        request,
        url,
        redirect(path, status) {
          if (request[responseSentSymbol$1]) {
            throw new AstroError({
              ...ResponseSentError
            });
          }
          return new Response(null, {
            status: status || 302,
            headers: {
              Location: path
            }
          });
        },
        response,
        slots: astroSlots
      };
      return Astro;
    },
    resolve,
    response,
    _metadata: {
      hasHydrationScript: false,
      rendererSpecificHydrationScripts: /* @__PURE__ */ new Set(),
      hasRenderedHead: false,
      hasDirectives: /* @__PURE__ */ new Set(),
      headInTree: false,
      extraHead: [],
      propagators: /* @__PURE__ */ new Set()
    }
  };
  return result;
}

class RenderContext {
  constructor(pipeline, locals, middleware, pathname, request, routeData, status, cookies = new AstroCookies(request), params = getParams(routeData, pathname), url = new URL(request.url)) {
    this.pipeline = pipeline;
    this.locals = locals;
    this.middleware = middleware;
    this.pathname = pathname;
    this.request = request;
    this.routeData = routeData;
    this.status = status;
    this.cookies = cookies;
    this.params = params;
    this.url = url;
  }
  static create({
    locals = {},
    middleware,
    pathname,
    pipeline,
    request,
    routeData,
    status = 200
  }) {
    return new RenderContext(
      pipeline,
      locals,
      sequence(...pipeline.internalMiddleware, middleware ?? pipeline.middleware),
      pathname,
      request,
      routeData,
      status
    );
  }
  /**
   * The main function of the RenderContext.
   *
   * Use this function to render any route known to Astro.
   * It attempts to render a route. A route can be a:
   *
   * - page
   * - redirect
   * - endpoint
   * - fallback
   */
  async render(componentInstance) {
    const { cookies, middleware, pathname, pipeline, routeData } = this;
    const { logger, routeCache, serverLike, streaming } = pipeline;
    const props = await getProps({
      mod: componentInstance,
      routeData,
      routeCache,
      pathname,
      logger,
      serverLike
    });
    const apiContext = this.createAPIContext(props);
    const { type } = routeData;
    const lastNext = type === "endpoint" ? () => renderEndpoint(componentInstance, apiContext, serverLike, logger) : type === "redirect" ? () => renderRedirect(this) : type === "page" ? async () => {
      const result = await this.createResult(componentInstance);
      const response2 = await renderPage(
        result,
        componentInstance?.default,
        props,
        {},
        streaming,
        routeData
      );
      response2.headers.set(ROUTE_TYPE_HEADER, "page");
      return response2;
    } : type === "fallback" ? () => new Response(null, { status: 500, headers: { [ROUTE_TYPE_HEADER]: "fallback" } }) : () => {
      throw new Error("Unknown type of route: " + type);
    };
    const response = await callMiddleware(middleware, apiContext, lastNext);
    if (response.headers.get(ROUTE_TYPE_HEADER)) {
      response.headers.delete(ROUTE_TYPE_HEADER);
    }
    attachCookiesToResponse(response, cookies);
    return response;
  }
  createAPIContext(props) {
    const renderContext = this;
    const { cookies, params, pipeline, request, url } = this;
    const generator = `Astro v${ASTRO_VERSION}`;
    const redirect = (path, status = 302) => new Response(null, { status, headers: { Location: path } });
    const site = pipeline.site ? new URL(pipeline.site) : void 0;
    return {
      cookies,
      get currentLocale() {
        return renderContext.computeCurrentLocale();
      },
      generator,
      params,
      get preferredLocale() {
        return renderContext.computePreferredLocale();
      },
      get preferredLocaleList() {
        return renderContext.computePreferredLocaleList();
      },
      props,
      redirect,
      request,
      site,
      url,
      get clientAddress() {
        if (clientAddressSymbol$1 in request) {
          return Reflect.get(request, clientAddressSymbol$1);
        }
        if (pipeline.adapterName) {
          throw new AstroError({
            ...ClientAddressNotAvailable,
            message: ClientAddressNotAvailable.message(pipeline.adapterName)
          });
        } else {
          throw new AstroError(StaticClientAddressNotAvailable);
        }
      },
      get locals() {
        return renderContext.locals;
      },
      // TODO(breaking): disallow replacing the locals object
      set locals(val) {
        if (typeof val !== "object") {
          throw new AstroError(LocalsNotAnObject);
        } else {
          renderContext.locals = val;
          Reflect.set(request, clientLocalsSymbol, val);
        }
      }
    };
  }
  async createResult(mod) {
    const { cookies, locals, params, pathname, pipeline, request, routeData, status } = this;
    const {
      adapterName,
      clientDirectives,
      compressHTML,
      i18n,
      manifest,
      logger,
      renderers,
      resolve,
      site,
      serverLike
    } = pipeline;
    const { links, scripts, styles } = await pipeline.headElements(routeData);
    const componentMetadata = await pipeline.componentMetadata(routeData) ?? manifest.componentMetadata;
    const { defaultLocale, locales, strategy } = i18n ?? {};
    const partial = Boolean(mod.partial);
    return createResult({
      adapterName,
      clientDirectives,
      componentMetadata,
      compressHTML,
      cookies,
      defaultLocale,
      locales,
      locals,
      logger,
      links,
      params,
      partial,
      pathname,
      renderers,
      resolve,
      request,
      route: routeData.route,
      strategy,
      site,
      scripts,
      ssr: serverLike,
      status,
      styles
    });
  }
  /**
   * API Context may be created multiple times per request, i18n data needs to be computed only once.
   * So, it is computed and saved here on creation of the first APIContext and reused for later ones.
   */
  #currentLocale;
  computeCurrentLocale() {
    const {
      url,
      pipeline: { i18n },
      routeData
    } = this;
    if (!i18n)
      return;
    const { defaultLocale, locales, strategy } = i18n;
    return this.#currentLocale ??= computeCurrentLocale(
      routeData.route,
      locales,
      strategy,
      defaultLocale
    );
  }
  #preferredLocale;
  computePreferredLocale() {
    const {
      pipeline: { i18n },
      request
    } = this;
    if (!i18n)
      return;
    return this.#preferredLocale ??= computePreferredLocale(request, i18n.locales);
  }
  #preferredLocaleList;
  computePreferredLocaleList() {
    const {
      pipeline: { i18n },
      request
    } = this;
    if (!i18n)
      return;
    return this.#preferredLocaleList ??= computePreferredLocaleList(request, i18n.locales);
  }
}

function createAssetLink(href, base, assetsPrefix) {
  if (assetsPrefix) {
    return joinPaths(assetsPrefix, slash(href));
  } else if (base) {
    return prependForwardSlash(joinPaths(base, slash(href)));
  } else {
    return href;
  }
}
function createStylesheetElement(stylesheet, base, assetsPrefix) {
  if (stylesheet.type === "inline") {
    return {
      props: {},
      children: stylesheet.content
    };
  } else {
    return {
      props: {
        rel: "stylesheet",
        href: createAssetLink(stylesheet.src, base, assetsPrefix)
      },
      children: ""
    };
  }
}
function createStylesheetElementSet(stylesheets, base, assetsPrefix) {
  return new Set(stylesheets.map((s) => createStylesheetElement(s, base, assetsPrefix)));
}
function createModuleScriptElement(script, base, assetsPrefix) {
  if (script.type === "external") {
    return createModuleScriptElementWithSrc(script.value, base, assetsPrefix);
  } else {
    return {
      props: {
        type: "module"
      },
      children: script.value
    };
  }
}
function createModuleScriptElementWithSrc(src, base, assetsPrefix) {
  return {
    props: {
      type: "module",
      src: createAssetLink(src, base, assetsPrefix)
    },
    children: ""
  };
}

function matchRoute(pathname, manifest) {
  const decodedPathname = decodeURI(pathname);
  return manifest.routes.find((route) => {
    return route.pattern.test(decodedPathname) || route.fallbackRoutes.some((fallbackRoute) => fallbackRoute.pattern.test(decodedPathname));
  });
}

class AppPipeline extends Pipeline {
  static create({
    logger,
    manifest,
    mode,
    renderers,
    resolve,
    serverLike,
    streaming
  }) {
    return new AppPipeline(logger, manifest, mode, renderers, resolve, serverLike, streaming);
  }
  headElements(routeData) {
    const routeInfo = this.manifest.routes.find((route) => route.routeData === routeData);
    const links = /* @__PURE__ */ new Set();
    const scripts = /* @__PURE__ */ new Set();
    const styles = createStylesheetElementSet(routeInfo?.styles ?? []);
    for (const script of routeInfo?.scripts ?? []) {
      if ("stage" in script) {
        if (script.stage === "head-inline") {
          scripts.add({
            props: {},
            children: script.children
          });
        }
      } else {
        scripts.add(createModuleScriptElement(script));
      }
    }
    return { links, styles, scripts };
  }
  componentMetadata() {
  }
}

class App {
  #manifest;
  #manifestData;
  #logger = new Logger({
    dest: consoleLogDestination,
    level: "info"
  });
  #baseWithoutTrailingSlash;
  #pipeline;
  #adapterLogger;
  #renderOptionsDeprecationWarningShown = false;
  constructor(manifest, streaming = true) {
    this.#manifest = manifest;
    this.#manifestData = {
      routes: manifest.routes.map((route) => route.routeData)
    };
    this.#baseWithoutTrailingSlash = removeTrailingForwardSlash(this.#manifest.base);
    this.#pipeline = this.#createPipeline(streaming);
    this.#adapterLogger = new AstroIntegrationLogger(
      this.#logger.options,
      this.#manifest.adapterName
    );
  }
  getAdapterLogger() {
    return this.#adapterLogger;
  }
  /**
   * Creates a pipeline by reading the stored manifest
   *
   * @param streaming
   * @private
   */
  #createPipeline(streaming = false) {
    return AppPipeline.create({
      logger: this.#logger,
      manifest: this.#manifest,
      mode: "production",
      renderers: this.#manifest.renderers,
      resolve: async (specifier) => {
        if (!(specifier in this.#manifest.entryModules)) {
          throw new Error(`Unable to resolve [${specifier}]`);
        }
        const bundlePath = this.#manifest.entryModules[specifier];
        switch (true) {
          case bundlePath.startsWith("data:"):
          case bundlePath.length === 0: {
            return bundlePath;
          }
          default: {
            return createAssetLink(bundlePath, this.#manifest.base, this.#manifest.assetsPrefix);
          }
        }
      },
      serverLike: true,
      streaming
    });
  }
  set setManifestData(newManifestData) {
    this.#manifestData = newManifestData;
  }
  removeBase(pathname) {
    if (pathname.startsWith(this.#manifest.base)) {
      return pathname.slice(this.#baseWithoutTrailingSlash.length + 1);
    }
    return pathname;
  }
  #getPathnameFromRequest(request) {
    const url = new URL(request.url);
    const pathname = prependForwardSlash(this.removeBase(url.pathname));
    return pathname;
  }
  match(request) {
    const url = new URL(request.url);
    if (this.#manifest.assets.has(url.pathname))
      return void 0;
    let pathname = this.#computePathnameFromDomain(request);
    if (!pathname) {
      pathname = prependForwardSlash(this.removeBase(url.pathname));
    }
    let routeData = matchRoute(pathname, this.#manifestData);
    if (!routeData || routeData.prerender)
      return void 0;
    return routeData;
  }
  #computePathnameFromDomain(request) {
    let pathname = void 0;
    const url = new URL(request.url);
    if (this.#manifest.i18n && (this.#manifest.i18n.strategy === "domains-prefix-always" || this.#manifest.i18n.strategy === "domains-prefix-other-locales" || this.#manifest.i18n.strategy === "domains-prefix-always-no-redirect")) {
      let host = request.headers.get("X-Forwarded-Host");
      let protocol = request.headers.get("X-Forwarded-Proto");
      if (protocol) {
        protocol = protocol + ":";
      } else {
        protocol = url.protocol;
      }
      if (!host) {
        host = request.headers.get("Host");
      }
      if (host && protocol) {
        host = host.split(":")[0];
        try {
          let locale;
          const hostAsUrl = new URL(`${protocol}//${host}`);
          for (const [domainKey, localeValue] of Object.entries(
            this.#manifest.i18n.domainLookupTable
          )) {
            const domainKeyAsUrl = new URL(domainKey);
            if (hostAsUrl.host === domainKeyAsUrl.host && hostAsUrl.protocol === domainKeyAsUrl.protocol) {
              locale = localeValue;
              break;
            }
          }
          if (locale) {
            pathname = prependForwardSlash(
              joinPaths(normalizeTheLocale(locale), this.removeBase(url.pathname))
            );
            if (url.pathname.endsWith("/")) {
              pathname = appendForwardSlash(pathname);
            }
          }
        } catch (e) {
          this.#logger.error(
            "router",
            `Astro tried to parse ${protocol}//${host} as an URL, but it threw a parsing error. Check the X-Forwarded-Host and X-Forwarded-Proto headers.`
          );
          this.#logger.error("router", `Error: ${e}`);
        }
      }
    }
    return pathname;
  }
  async render(request, routeDataOrOptions, maybeLocals) {
    let routeData;
    let locals;
    let clientAddress;
    let addCookieHeader;
    if (routeDataOrOptions && ("addCookieHeader" in routeDataOrOptions || "clientAddress" in routeDataOrOptions || "locals" in routeDataOrOptions || "routeData" in routeDataOrOptions)) {
      if ("addCookieHeader" in routeDataOrOptions) {
        addCookieHeader = routeDataOrOptions.addCookieHeader;
      }
      if ("clientAddress" in routeDataOrOptions) {
        clientAddress = routeDataOrOptions.clientAddress;
      }
      if ("routeData" in routeDataOrOptions) {
        routeData = routeDataOrOptions.routeData;
      }
      if ("locals" in routeDataOrOptions) {
        locals = routeDataOrOptions.locals;
      }
    } else {
      routeData = routeDataOrOptions;
      locals = maybeLocals;
      if (routeDataOrOptions || locals) {
        this.#logRenderOptionsDeprecationWarning();
      }
    }
    if (locals) {
      if (typeof locals !== "object") {
        this.#logger.error(null, new AstroError(LocalsNotAnObject).stack);
        return this.#renderError(request, { status: 500 });
      }
      Reflect.set(request, clientLocalsSymbol, locals);
    }
    if (clientAddress) {
      Reflect.set(request, clientAddressSymbol$1, clientAddress);
    }
    if (request.url !== collapseDuplicateSlashes(request.url)) {
      request = new Request(collapseDuplicateSlashes(request.url), request);
    }
    if (!routeData) {
      routeData = this.match(request);
    }
    if (!routeData) {
      return this.#renderError(request, { status: 404 });
    }
    const pathname = this.#getPathnameFromRequest(request);
    const defaultStatus = this.#getDefaultStatusCode(routeData, pathname);
    const mod = await this.#getModuleForRoute(routeData);
    let response;
    try {
      const renderContext = RenderContext.create({
        pipeline: this.#pipeline,
        locals,
        pathname,
        request,
        routeData,
        status: defaultStatus
      });
      response = await renderContext.render(await mod.page());
    } catch (err) {
      this.#logger.error(null, err.stack || err.message || String(err));
      return this.#renderError(request, { status: 500 });
    }
    if (REROUTABLE_STATUS_CODES.includes(response.status) && response.headers.get(REROUTE_DIRECTIVE_HEADER) !== "no") {
      return this.#renderError(request, {
        response,
        status: response.status
      });
    }
    if (response.headers.has(REROUTE_DIRECTIVE_HEADER)) {
      response.headers.delete(REROUTE_DIRECTIVE_HEADER);
    }
    if (addCookieHeader) {
      for (const setCookieHeaderValue of App.getSetCookieFromResponse(response)) {
        response.headers.append("set-cookie", setCookieHeaderValue);
      }
    }
    Reflect.set(response, responseSentSymbol$1, true);
    return response;
  }
  #logRenderOptionsDeprecationWarning() {
    if (this.#renderOptionsDeprecationWarningShown)
      return;
    this.#logger.warn(
      "deprecated",
      `The adapter ${this.#manifest.adapterName} is using a deprecated signature of the 'app.render()' method. From Astro 4.0, locals and routeData are provided as properties on an optional object to this method. Using the old signature will cause an error in Astro 5.0. See https://github.com/withastro/astro/pull/9199 for more information.`
    );
    this.#renderOptionsDeprecationWarningShown = true;
  }
  setCookieHeaders(response) {
    return getSetCookiesFromResponse(response);
  }
  /**
   * Reads all the cookies written by `Astro.cookie.set()` onto the passed response.
   * For example,
   * ```ts
   * for (const cookie_ of App.getSetCookieFromResponse(response)) {
   *     const cookie: string = cookie_
   * }
   * ```
   * @param response The response to read cookies from.
   * @returns An iterator that yields key-value pairs as equal-sign-separated strings.
   */
  static getSetCookieFromResponse = getSetCookiesFromResponse;
  /**
   * If it is a known error code, try sending the according page (e.g. 404.astro / 500.astro).
   * This also handles pre-rendered /404 or /500 routes
   */
  async #renderError(request, { status, response: originalResponse, skipMiddleware = false }) {
    const errorRoutePath = `/${status}${this.#manifest.trailingSlash === "always" ? "/" : ""}`;
    const errorRouteData = matchRoute(errorRoutePath, this.#manifestData);
    const url = new URL(request.url);
    if (errorRouteData) {
      if (errorRouteData.prerender) {
        const maybeDotHtml = errorRouteData.route.endsWith(`/${status}`) ? ".html" : "";
        const statusURL = new URL(
          `${this.#baseWithoutTrailingSlash}/${status}${maybeDotHtml}`,
          url
        );
        const response2 = await fetch(statusURL.toString());
        const override = { status };
        return this.#mergeResponses(response2, originalResponse, override);
      }
      const mod = await this.#getModuleForRoute(errorRouteData);
      try {
        const renderContext = RenderContext.create({
          pipeline: this.#pipeline,
          middleware: skipMiddleware ? (_, next) => next() : void 0,
          pathname: this.#getPathnameFromRequest(request),
          request,
          routeData: errorRouteData,
          status
        });
        const response2 = await renderContext.render(await mod.page());
        return this.#mergeResponses(response2, originalResponse);
      } catch {
        if (skipMiddleware === false) {
          return this.#renderError(request, {
            status,
            response: originalResponse,
            skipMiddleware: true
          });
        }
      }
    }
    const response = this.#mergeResponses(new Response(null, { status }), originalResponse);
    Reflect.set(response, responseSentSymbol$1, true);
    return response;
  }
  #mergeResponses(newResponse, originalResponse, override) {
    if (!originalResponse) {
      if (override !== void 0) {
        return new Response(newResponse.body, {
          status: override.status,
          statusText: newResponse.statusText,
          headers: newResponse.headers
        });
      }
      return newResponse;
    }
    const status = override?.status ? override.status : originalResponse.status === 200 ? newResponse.status : originalResponse.status;
    try {
      originalResponse.headers.delete("Content-type");
    } catch {
    }
    return new Response(newResponse.body, {
      status,
      statusText: status === 200 ? newResponse.statusText : originalResponse.statusText,
      // If you're looking at here for possible bugs, it means that it's not a bug.
      // With the middleware, users can meddle with headers, and we should pass to the 404/500.
      // If users see something weird, it's because they are setting some headers they should not.
      //
      // Although, we don't want it to replace the content-type, because the error page must return `text/html`
      headers: new Headers([
        ...Array.from(newResponse.headers),
        ...Array.from(originalResponse.headers)
      ])
    });
  }
  #getDefaultStatusCode(routeData, pathname) {
    if (!routeData.pattern.exec(pathname)) {
      for (const fallbackRoute of routeData.fallbackRoutes) {
        if (fallbackRoute.pattern.test(pathname)) {
          return 302;
        }
      }
    }
    const route = removeTrailingForwardSlash(routeData.route);
    if (route.endsWith("/404"))
      return 404;
    if (route.endsWith("/500"))
      return 500;
    return 200;
  }
  async #getModuleForRoute(route) {
    if (route.type === "redirect") {
      return RedirectSinglePageBuiltModule;
    } else {
      if (this.#manifest.pageMap) {
        const importComponentInstance = this.#manifest.pageMap.get(route.component);
        if (!importComponentInstance) {
          throw new Error(
            `Unexpectedly unable to find a component instance for route ${route.route}`
          );
        }
        const pageModule = await importComponentInstance();
        return pageModule;
      } else if (this.#manifest.pageModule) {
        const importComponentInstance = this.#manifest.pageModule;
        return importComponentInstance;
      } else {
        throw new Error(
          "Astro couldn't find the correct page to render, probably because it wasn't correctly mapped for SSR usage. This is an internal error, please file an issue."
        );
      }
    }
  }
}

const version = "4.4.10";

const createOutgoingHttpHeaders = (headers) => {
  if (!headers) {
    return void 0;
  }
  const nodeHeaders = Object.fromEntries(headers.entries());
  if (Object.keys(nodeHeaders).length === 0) {
    return void 0;
  }
  if (headers.has("set-cookie")) {
    const cookieHeaders = headers.getSetCookie();
    if (cookieHeaders.length > 1) {
      nodeHeaders["set-cookie"] = cookieHeaders;
    }
  }
  return nodeHeaders;
};

const clientAddressSymbol = Symbol.for("astro.clientAddress");
class NodeApp extends App {
  match(req) {
    if (!(req instanceof Request)) {
      req = NodeApp.createRequest(req, {
        skipBody: true
      });
    }
    return super.match(req);
  }
  render(req, routeDataOrOptions, maybeLocals) {
    if (!(req instanceof Request)) {
      req = NodeApp.createRequest(req);
    }
    return super.render(req, routeDataOrOptions, maybeLocals);
  }
  /**
   * Converts a NodeJS IncomingMessage into a web standard Request.
   * ```js
   * import { NodeApp } from 'astro/app/node';
   * import { createServer } from 'node:http';
   *
   * const server = createServer(async (req, res) => {
   *     const request = NodeApp.createRequest(req);
   *     const response = await app.render(request);
   *     await NodeApp.writeResponse(response, res);
   * })
   * ```
   */
  static createRequest(req, { skipBody = false } = {}) {
    const protocol = req.headers["x-forwarded-proto"] ?? ("encrypted" in req.socket && req.socket.encrypted ? "https" : "http");
    const hostname = req.headers.host || req.headers[":authority"];
    const url = `${protocol}://${hostname}${req.url}`;
    const options = {
      method: req.method || "GET",
      headers: makeRequestHeaders(req)
    };
    const bodyAllowed = options.method !== "HEAD" && options.method !== "GET" && skipBody === false;
    if (bodyAllowed) {
      Object.assign(options, makeRequestBody(req));
    }
    const request = new Request(url, options);
    if (req.socket?.remoteAddress) {
      Reflect.set(request, clientAddressSymbol, req.socket.remoteAddress);
    }
    return request;
  }
  /**
   * Streams a web-standard Response into a NodeJS Server Response.
   * ```js
   * import { NodeApp } from 'astro/app/node';
   * import { createServer } from 'node:http';
   *
   * const server = createServer(async (req, res) => {
   *     const request = NodeApp.createRequest(req);
   *     const response = await app.render(request);
   *     await NodeApp.writeResponse(response, res);
   * })
   * ```
   * @param source WhatWG Response
   * @param destination NodeJS ServerResponse
   */
  static async writeResponse(source, destination) {
    const { status, headers, body } = source;
    destination.writeHead(status, createOutgoingHttpHeaders(headers));
    if (!body)
      return destination.end();
    try {
      const reader = body.getReader();
      destination.on("close", () => {
        reader.cancel().catch((err) => {
          console.error(
            `There was an uncaught error in the middle of the stream while rendering ${destination.req.url}.`,
            err
          );
        });
      });
      let result = await reader.read();
      while (!result.done) {
        destination.write(result.value);
        result = await reader.read();
      }
      destination.end();
    } catch {
      destination.end("Internal server error");
    }
  }
}
function makeRequestHeaders(req) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === void 0) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else {
      headers.append(name, value);
    }
  }
  return headers;
}
function makeRequestBody(req) {
  if (req.body !== void 0) {
    if (typeof req.body === "string" && req.body.length > 0) {
      return { body: Buffer.from(req.body) };
    }
    if (typeof req.body === "object" && req.body !== null && Object.keys(req.body).length > 0) {
      return { body: Buffer.from(JSON.stringify(req.body)) };
    }
    if (typeof req.body === "object" && req.body !== null && typeof req.body[Symbol.asyncIterator] !== "undefined") {
      return asyncIterableToBodyProps(req.body);
    }
  }
  return asyncIterableToBodyProps(req);
}
function asyncIterableToBodyProps(iterable) {
  return {
    // Node uses undici for the Request implementation. Undici accepts
    // a non-standard async iterable for the body.
    // @ts-expect-error
    body: iterable,
    // The duplex property is required when using a ReadableStream or async
    // iterable for the body. The type definitions do not include the duplex
    // property because they are not up-to-date.
    duplex: "half"
  };
}

/** Returns the function bound to the given object. */
const __function_bind = Function.bind.bind(Function.call);
/** Returns whether the object prototype exists in another object. */
const __object_isPrototypeOf = Function.call.bind(Object.prototype.isPrototypeOf);
/** Current high resolution millisecond timestamp. */
const __performance_now = performance.now;
// @ts-expect-error
const INTERNALS = new WeakMap();
const internalsOf = (target, className, propName) => {
    const internals = INTERNALS.get(target);
    if (!internals)
        throw new TypeError(`${className}.${propName} can only be used on instances of ${className}`);
    return internals;
};
const allowStringTag = (value) => (value.prototype[Symbol.toStringTag] = value.name);

class DOMException extends Error {
    constructor(message = '', name = 'Error') {
        super(message);
        this.code = 0;
        this.name = name;
    }
}
DOMException.INDEX_SIZE_ERR = 1;
DOMException.DOMSTRING_SIZE_ERR = 2;
DOMException.HIERARCHY_REQUEST_ERR = 3;
DOMException.WRONG_DOCUMENT_ERR = 4;
DOMException.INVALID_CHARACTER_ERR = 5;
DOMException.NO_DATA_ALLOWED_ERR = 6;
DOMException.NO_MODIFICATION_ALLOWED_ERR = 7;
DOMException.NOT_FOUND_ERR = 8;
DOMException.NOT_SUPPORTED_ERR = 9;
DOMException.INUSE_ATTRIBUTE_ERR = 10;
DOMException.INVALID_STATE_ERR = 11;
DOMException.SYNTAX_ERR = 12;
DOMException.INVALID_MODIFICATION_ERR = 13;
DOMException.NAMESPACE_ERR = 14;
DOMException.INVALID_ACCESS_ERR = 15;
DOMException.VALIDATION_ERR = 16;
DOMException.TYPE_MISMATCH_ERR = 17;
DOMException.SECURITY_ERR = 18;
DOMException.NETWORK_ERR = 19;
DOMException.ABORT_ERR = 20;
DOMException.URL_MISMATCH_ERR = 21;
DOMException.QUOTA_EXCEEDED_ERR = 22;
DOMException.TIMEOUT_ERR = 23;
DOMException.INVALID_NODE_TYPE_ERR = 24;
DOMException.DATA_CLONE_ERR = 25;
allowStringTag(DOMException);

/**
 * Assert a condition.
 * @param condition The condition that it should satisfy.
 * @param message The error message.
 * @param args The arguments for replacing placeholders in the message.
 */
function assertType(condition, message, ...args) {
    if (!condition) {
        throw new TypeError(format(message, args));
    }
}
/**
 * Convert a text and arguments to one string.
 * @param message The formating text
 * @param args The arguments.
 */
function format(message, args) {
    let i = 0;
    return message.replace(/%[os]/gu, () => anyToString(args[i++]));
}
/**
 * Convert a value to a string representation.
 * @param x The value to get the string representation.
 */
function anyToString(x) {
    if (typeof x !== "object" || x === null) {
        return String(x);
    }
    return Object.prototype.toString.call(x);
}

let currentErrorHandler;
/**
 * Print a error message.
 * @param maybeError The error object.
 */
function reportError(maybeError) {
    try {
        const error = maybeError instanceof Error
            ? maybeError
            : new Error(anyToString(maybeError));
        // Call the user-defined error handler if exists.
        if (currentErrorHandler) ;
        // Dispatch an `error` event if this is on a browser.
        if (typeof dispatchEvent === "function" &&
            typeof ErrorEvent === "function") {
            dispatchEvent(new ErrorEvent("error", { error, message: error.message }));
        }
        // Emit an `uncaughtException` event if this is on Node.js.
        //istanbul ignore else
        else if (typeof process !== "undefined" &&
            typeof process.emit === "function") {
            process.emit("uncaughtException", error);
            return;
        }
        // Otherwise, print the error.
        console.error(error);
    }
    catch (_a) {
        // ignore.
    }
}

let currentWarnHandler;
/**
 * The warning information.
 */
class Warning {
    constructor(code, message) {
        this.code = code;
        this.message = message;
    }
    /**
     * Report this warning.
     * @param args The arguments of the warning.
     */
    warn(...args) {
        var _a;
        try {
            // Call the user-defined warning handler if exists.
            if (currentWarnHandler) ;
            // Otherwise, print the warning.
            const stack = ((_a = new Error().stack) !== null && _a !== void 0 ? _a : "").replace(/^(?:.+?\n){2}/gu, "\n");
            console.warn(this.message, ...args, stack);
        }
        catch (_b) {
            // Ignore.
        }
    }
}

const InitEventWasCalledWhileDispatching = new Warning("W01", "Unable to initialize event under dispatching.");
const FalsyWasAssignedToCancelBubble = new Warning("W02", "Assigning any falsy value to 'cancelBubble' property has no effect.");
const TruthyWasAssignedToReturnValue = new Warning("W03", "Assigning any truthy value to 'returnValue' property has no effect.");
const NonCancelableEventWasCanceled = new Warning("W04", "Unable to preventDefault on non-cancelable events.");
const CanceledInPassiveListener = new Warning("W05", "Unable to preventDefault inside passive event listener invocation.");
const EventListenerWasDuplicated = new Warning("W06", "An event listener wasn't added because it has been added already: %o, %o");
const OptionWasIgnored = new Warning("W07", "The %o option value was abandoned because the event listener wasn't added as duplicated.");
const InvalidEventListener = new Warning("W08", "The 'callback' argument must be a function or an object that has 'handleEvent' method: %o");

/*eslint-disable class-methods-use-this */
/**
 * An implementation of `Event` interface, that wraps a given event object.
 * `EventTarget` shim can control the internal state of this `Event` objects.
 * @see https://dom.spec.whatwg.org/#event
 */
class Event {
    /**
     * @see https://dom.spec.whatwg.org/#dom-event-none
     */
    static get NONE() {
        return NONE;
    }
    /**
     * @see https://dom.spec.whatwg.org/#dom-event-capturing_phase
     */
    static get CAPTURING_PHASE() {
        return CAPTURING_PHASE;
    }
    /**
     * @see https://dom.spec.whatwg.org/#dom-event-at_target
     */
    static get AT_TARGET() {
        return AT_TARGET;
    }
    /**
     * @see https://dom.spec.whatwg.org/#dom-event-bubbling_phase
     */
    static get BUBBLING_PHASE() {
        return BUBBLING_PHASE;
    }
    /**
     * Initialize this event instance.
     * @param type The type of this event.
     * @param eventInitDict Options to initialize.
     * @see https://dom.spec.whatwg.org/#dom-event-event
     */
    constructor(type, eventInitDict) {
        Object.defineProperty(this, "isTrusted", {
            value: false,
            enumerable: true,
        });
        const opts = eventInitDict !== null && eventInitDict !== void 0 ? eventInitDict : {};
        internalDataMap.set(this, {
            type: String(type),
            bubbles: Boolean(opts.bubbles),
            cancelable: Boolean(opts.cancelable),
            composed: Boolean(opts.composed),
            target: null,
            currentTarget: null,
            stopPropagationFlag: false,
            stopImmediatePropagationFlag: false,
            canceledFlag: false,
            inPassiveListenerFlag: false,
            dispatchFlag: false,
            timeStamp: Date.now(),
        });
    }
    /**
     * The type of this event.
     * @see https://dom.spec.whatwg.org/#dom-event-type
     */
    get type() {
        return $(this).type;
    }
    /**
     * The event target of the current dispatching.
     * @see https://dom.spec.whatwg.org/#dom-event-target
     */
    get target() {
        return $(this).target;
    }
    /**
     * The event target of the current dispatching.
     * @deprecated Use the `target` property instead.
     * @see https://dom.spec.whatwg.org/#dom-event-srcelement
     */
    get srcElement() {
        return $(this).target;
    }
    /**
     * The event target of the current dispatching.
     * @see https://dom.spec.whatwg.org/#dom-event-currenttarget
     */
    get currentTarget() {
        return $(this).currentTarget;
    }
    /**
     * The event target of the current dispatching.
     * This doesn't support node tree.
     * @see https://dom.spec.whatwg.org/#dom-event-composedpath
     */
    composedPath() {
        const currentTarget = $(this).currentTarget;
        if (currentTarget) {
            return [currentTarget];
        }
        return [];
    }
    /**
     * @see https://dom.spec.whatwg.org/#dom-event-none
     */
    get NONE() {
        return NONE;
    }
    /**
     * @see https://dom.spec.whatwg.org/#dom-event-capturing_phase
     */
    get CAPTURING_PHASE() {
        return CAPTURING_PHASE;
    }
    /**
     * @see https://dom.spec.whatwg.org/#dom-event-at_target
     */
    get AT_TARGET() {
        return AT_TARGET;
    }
    /**
     * @see https://dom.spec.whatwg.org/#dom-event-bubbling_phase
     */
    get BUBBLING_PHASE() {
        return BUBBLING_PHASE;
    }
    /**
     * The current event phase.
     * @see https://dom.spec.whatwg.org/#dom-event-eventphase
     */
    get eventPhase() {
        return $(this).dispatchFlag ? 2 : 0;
    }
    /**
     * Stop event bubbling.
     * Because this shim doesn't support node tree, this merely changes the `cancelBubble` property value.
     * @see https://dom.spec.whatwg.org/#dom-event-stoppropagation
     */
    stopPropagation() {
        $(this).stopPropagationFlag = true;
    }
    /**
     * `true` if event bubbling was stopped.
     * @deprecated
     * @see https://dom.spec.whatwg.org/#dom-event-cancelbubble
     */
    get cancelBubble() {
        return $(this).stopPropagationFlag;
    }
    /**
     * Stop event bubbling if `true` is set.
     * @deprecated Use the `stopPropagation()` method instead.
     * @see https://dom.spec.whatwg.org/#dom-event-cancelbubble
     */
    set cancelBubble(value) {
        if (value) {
            $(this).stopPropagationFlag = true;
        }
        else {
            FalsyWasAssignedToCancelBubble.warn();
        }
    }
    /**
     * Stop event bubbling and subsequent event listener callings.
     * @see https://dom.spec.whatwg.org/#dom-event-stopimmediatepropagation
     */
    stopImmediatePropagation() {
        const data = $(this);
        data.stopPropagationFlag = data.stopImmediatePropagationFlag = true;
    }
    /**
     * `true` if this event will bubble.
     * @see https://dom.spec.whatwg.org/#dom-event-bubbles
     */
    get bubbles() {
        return $(this).bubbles;
    }
    /**
     * `true` if this event can be canceled by the `preventDefault()` method.
     * @see https://dom.spec.whatwg.org/#dom-event-cancelable
     */
    get cancelable() {
        return $(this).cancelable;
    }
    /**
     * `true` if the default behavior will act.
     * @deprecated Use the `defaultPrevented` proeprty instead.
     * @see https://dom.spec.whatwg.org/#dom-event-returnvalue
     */
    get returnValue() {
        return !$(this).canceledFlag;
    }
    /**
     * Cancel the default behavior if `false` is set.
     * @deprecated Use the `preventDefault()` method instead.
     * @see https://dom.spec.whatwg.org/#dom-event-returnvalue
     */
    set returnValue(value) {
        if (!value) {
            setCancelFlag($(this));
        }
        else {
            TruthyWasAssignedToReturnValue.warn();
        }
    }
    /**
     * Cancel the default behavior.
     * @see https://dom.spec.whatwg.org/#dom-event-preventdefault
     */
    preventDefault() {
        setCancelFlag($(this));
    }
    /**
     * `true` if the default behavior was canceled.
     * @see https://dom.spec.whatwg.org/#dom-event-defaultprevented
     */
    get defaultPrevented() {
        return $(this).canceledFlag;
    }
    /**
     * @see https://dom.spec.whatwg.org/#dom-event-composed
     */
    get composed() {
        return $(this).composed;
    }
    /**
     * @see https://dom.spec.whatwg.org/#dom-event-istrusted
     */
    //istanbul ignore next
    get isTrusted() {
        return false;
    }
    /**
     * @see https://dom.spec.whatwg.org/#dom-event-timestamp
     */
    get timeStamp() {
        return $(this).timeStamp;
    }
    /**
     * @deprecated Don't use this method. The constructor did initialization.
     */
    initEvent(type, bubbles = false, cancelable = false) {
        const data = $(this);
        if (data.dispatchFlag) {
            InitEventWasCalledWhileDispatching.warn();
            return;
        }
        internalDataMap.set(this, {
            ...data,
            type: String(type),
            bubbles: Boolean(bubbles),
            cancelable: Boolean(cancelable),
            target: null,
            currentTarget: null,
            stopPropagationFlag: false,
            stopImmediatePropagationFlag: false,
            canceledFlag: false,
        });
    }
}
//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
const NONE = 0;
const CAPTURING_PHASE = 1;
const AT_TARGET = 2;
const BUBBLING_PHASE = 3;
/**
 * Private data for event wrappers.
 */
const internalDataMap = new WeakMap();
/**
 * Get private data.
 * @param event The event object to get private data.
 * @param name The variable name to report.
 * @returns The private data of the event.
 */
function $(event, name = "this") {
    const retv = internalDataMap.get(event);
    assertType(retv != null, "'%s' must be an object that Event constructor created, but got another one: %o", name, event);
    return retv;
}
/**
 * https://dom.spec.whatwg.org/#set-the-canceled-flag
 * @param data private data.
 */
function setCancelFlag(data) {
    if (data.inPassiveListenerFlag) {
        CanceledInPassiveListener.warn();
        return;
    }
    if (!data.cancelable) {
        NonCancelableEventWasCanceled.warn();
        return;
    }
    data.canceledFlag = true;
}
// Set enumerable
Object.defineProperty(Event, "NONE", { enumerable: true });
Object.defineProperty(Event, "CAPTURING_PHASE", { enumerable: true });
Object.defineProperty(Event, "AT_TARGET", { enumerable: true });
Object.defineProperty(Event, "BUBBLING_PHASE", { enumerable: true });
const keys$1 = Object.getOwnPropertyNames(Event.prototype);
for (let i = 0; i < keys$1.length; ++i) {
    if (keys$1[i] === "constructor") {
        continue;
    }
    Object.defineProperty(Event.prototype, keys$1[i], { enumerable: true });
}

/**
 * An implementation of `Event` interface, that wraps a given event object.
 * This class controls the internal state of `Event`.
 * @see https://dom.spec.whatwg.org/#interface-event
 */
class EventWrapper extends Event {
    /**
     * Wrap a given event object to control states.
     * @param event The event-like object to wrap.
     */
    static wrap(event) {
        return new (getWrapperClassOf(event))(event);
    }
    constructor(event) {
        super(event.type, {
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            composed: event.composed,
        });
        if (event.cancelBubble) {
            super.stopPropagation();
        }
        if (event.defaultPrevented) {
            super.preventDefault();
        }
        internalDataMap$1.set(this, { original: event });
        // Define accessors
        const keys = Object.keys(event);
        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            if (!(key in this)) {
                Object.defineProperty(this, key, defineRedirectDescriptor(event, key));
            }
        }
    }
    stopPropagation() {
        super.stopPropagation();
        const { original } = $$1(this);
        if ("stopPropagation" in original) {
            original.stopPropagation();
        }
    }
    get cancelBubble() {
        return super.cancelBubble;
    }
    set cancelBubble(value) {
        super.cancelBubble = value;
        const { original } = $$1(this);
        if ("cancelBubble" in original) {
            original.cancelBubble = value;
        }
    }
    stopImmediatePropagation() {
        super.stopImmediatePropagation();
        const { original } = $$1(this);
        if ("stopImmediatePropagation" in original) {
            original.stopImmediatePropagation();
        }
    }
    get returnValue() {
        return super.returnValue;
    }
    set returnValue(value) {
        super.returnValue = value;
        const { original } = $$1(this);
        if ("returnValue" in original) {
            original.returnValue = value;
        }
    }
    preventDefault() {
        super.preventDefault();
        const { original } = $$1(this);
        if ("preventDefault" in original) {
            original.preventDefault();
        }
    }
    get timeStamp() {
        const { original } = $$1(this);
        if ("timeStamp" in original) {
            return original.timeStamp;
        }
        return super.timeStamp;
    }
}
/**
 * Private data for event wrappers.
 */
const internalDataMap$1 = new WeakMap();
/**
 * Get private data.
 * @param event The event object to get private data.
 * @returns The private data of the event.
 */
function $$1(event) {
    const retv = internalDataMap$1.get(event);
    assertType(retv != null, "'this' is expected an Event object, but got", event);
    return retv;
}
/**
 * Cache for wrapper classes.
 * @type {WeakMap<Object, Function>}
 * @private
 */
const wrapperClassCache = new WeakMap();
// Make association for wrappers.
wrapperClassCache.set(Object.prototype, EventWrapper);
/**
 * Get the wrapper class of a given prototype.
 * @param originalEvent The event object to wrap.
 */
function getWrapperClassOf(originalEvent) {
    const prototype = Object.getPrototypeOf(originalEvent);
    if (prototype == null) {
        return EventWrapper;
    }
    let wrapper = wrapperClassCache.get(prototype);
    if (wrapper == null) {
        wrapper = defineWrapper(getWrapperClassOf(prototype), prototype);
        wrapperClassCache.set(prototype, wrapper);
    }
    return wrapper;
}
/**
 * Define new wrapper class.
 * @param BaseEventWrapper The base wrapper class.
 * @param originalPrototype The prototype of the original event.
 */
function defineWrapper(BaseEventWrapper, originalPrototype) {
    class CustomEventWrapper extends BaseEventWrapper {
    }
    const keys = Object.keys(originalPrototype);
    for (let i = 0; i < keys.length; ++i) {
        Object.defineProperty(CustomEventWrapper.prototype, keys[i], defineRedirectDescriptor(originalPrototype, keys[i]));
    }
    return CustomEventWrapper;
}
/**
 * Get the property descriptor to redirect a given property.
 */
function defineRedirectDescriptor(obj, key) {
    const d = Object.getOwnPropertyDescriptor(obj, key);
    return {
        get() {
            const original = $$1(this).original;
            const value = original[key];
            if (typeof value === "function") {
                return value.bind(original);
            }
            return value;
        },
        set(value) {
            const original = $$1(this).original;
            original[key] = value;
        },
        configurable: d.configurable,
        enumerable: d.enumerable,
    };
}

/**
 * Create a new listener.
 * @param callback The callback function.
 * @param capture The capture flag.
 * @param passive The passive flag.
 * @param once The once flag.
 * @param signal The abort signal.
 * @param signalListener The abort event listener for the abort signal.
 */
function createListener(callback, capture, passive, once, signal, signalListener) {
    return {
        callback,
        flags: (capture ? 1 /* Capture */ : 0) |
            (passive ? 2 /* Passive */ : 0) |
            (once ? 4 /* Once */ : 0),
        signal,
        signalListener,
    };
}
/**
 * Set the `removed` flag to the given listener.
 * @param listener The listener to check.
 */
function setRemoved(listener) {
    listener.flags |= 8 /* Removed */;
}
/**
 * Check if the given listener has the `capture` flag or not.
 * @param listener The listener to check.
 */
function isCapture(listener) {
    return (listener.flags & 1 /* Capture */) === 1 /* Capture */;
}
/**
 * Check if the given listener has the `passive` flag or not.
 * @param listener The listener to check.
 */
function isPassive(listener) {
    return (listener.flags & 2 /* Passive */) === 2 /* Passive */;
}
/**
 * Check if the given listener has the `once` flag or not.
 * @param listener The listener to check.
 */
function isOnce(listener) {
    return (listener.flags & 4 /* Once */) === 4 /* Once */;
}
/**
 * Check if the given listener has the `removed` flag or not.
 * @param listener The listener to check.
 */
function isRemoved(listener) {
    return (listener.flags & 8 /* Removed */) === 8 /* Removed */;
}
/**
 * Call an event listener.
 * @param listener The listener to call.
 * @param target The event target object for `thisArg`.
 * @param event The event object for the first argument.
 * @param attribute `true` if this callback is an event attribute handler.
 */
function invokeCallback({ callback }, target, event) {
    try {
        if (typeof callback === "function") {
            callback.call(target, event);
        }
        else if (typeof callback.handleEvent === "function") {
            callback.handleEvent(event);
        }
    }
    catch (thrownError) {
        reportError(thrownError);
    }
}

/**
 * Find the index of given listener.
 * This returns `-1` if not found.
 * @param list The listener list.
 * @param callback The callback function to find.
 * @param capture The capture flag to find.
 */
function findIndexOfListener({ listeners }, callback, capture) {
    for (let i = 0; i < listeners.length; ++i) {
        if (listeners[i].callback === callback &&
            isCapture(listeners[i]) === capture) {
            return i;
        }
    }
    return -1;
}
/**
 * Add the given listener.
 * Does copy-on-write if needed.
 * @param list The listener list.
 * @param callback The callback function.
 * @param capture The capture flag.
 * @param passive The passive flag.
 * @param once The once flag.
 * @param signal The abort signal.
 */
function addListener(list, callback, capture, passive, once, signal) {
    let signalListener;
    if (signal) {
        signalListener = removeListener.bind(null, list, callback, capture);
        signal.addEventListener("abort", signalListener);
    }
    const listener = createListener(callback, capture, passive, once, signal, signalListener);
    if (list.cow) {
        list.cow = false;
        list.listeners = [...list.listeners, listener];
    }
    else {
        list.listeners.push(listener);
    }
    return listener;
}
/**
 * Remove a listener.
 * @param list The listener list.
 * @param callback The callback function to find.
 * @param capture The capture flag to find.
 * @returns `true` if it mutated the list directly.
 */
function removeListener(list, callback, capture) {
    const index = findIndexOfListener(list, callback, capture);
    if (index !== -1) {
        return removeListenerAt(list, index);
    }
    return false;
}
/**
 * Remove a listener.
 * @param list The listener list.
 * @param index The index of the target listener.
 * @param disableCow Disable copy-on-write if true.
 * @returns `true` if it mutated the `listeners` array directly.
 */
function removeListenerAt(list, index, disableCow = false) {
    const listener = list.listeners[index];
    // Set the removed flag.
    setRemoved(listener);
    // Dispose the abort signal listener if exists.
    if (listener.signal) {
        listener.signal.removeEventListener("abort", listener.signalListener);
    }
    // Remove it from the array.
    if (list.cow && !disableCow) {
        list.cow = false;
        list.listeners = list.listeners.filter((_, i) => i !== index);
        return false;
    }
    list.listeners.splice(index, 1);
    return true;
}

/**
 * Create a new `ListenerListMap` object.
 */
function createListenerListMap() {
    return Object.create(null);
}
/**
 * Get the listener list of the given type.
 * If the listener list has not been initialized, initialize and return it.
 * @param listenerMap The listener list map.
 * @param type The event type to get.
 */
function ensureListenerList(listenerMap, type) {
    var _a;
    return ((_a = listenerMap[type]) !== null && _a !== void 0 ? _a : (listenerMap[type] = {
        attrCallback: undefined,
        attrListener: undefined,
        cow: false,
        listeners: [],
    }));
}

/**
 * An implementation of the `EventTarget` interface.
 * @see https://dom.spec.whatwg.org/#eventtarget
 */
class EventTarget {
    /**
     * Initialize this instance.
     */
    constructor() {
        internalDataMap$2.set(this, createListenerListMap());
    }
    // Implementation
    addEventListener(type0, callback0, options0) {
        const listenerMap = $$2(this);
        const { callback, capture, once, passive, signal, type, } = normalizeAddOptions(type0, callback0, options0);
        if (callback == null || (signal === null || signal === void 0 ? void 0 : signal.aborted)) {
            return;
        }
        const list = ensureListenerList(listenerMap, type);
        // Find existing listener.
        const i = findIndexOfListener(list, callback, capture);
        if (i !== -1) {
            warnDuplicate(list.listeners[i], passive, once, signal);
            return;
        }
        // Add the new listener.
        addListener(list, callback, capture, passive, once, signal);
    }
    // Implementation
    removeEventListener(type0, callback0, options0) {
        const listenerMap = $$2(this);
        const { callback, capture, type } = normalizeOptions(type0, callback0, options0);
        const list = listenerMap[type];
        if (callback != null && list) {
            removeListener(list, callback, capture);
        }
    }
    // Implementation
    dispatchEvent(e) {
        const list = $$2(this)[String(e.type)];
        if (list == null) {
            return true;
        }
        const event = e instanceof Event ? e : EventWrapper.wrap(e);
        const eventData = $(event, "event");
        if (eventData.dispatchFlag) {
           throw new DOMException("This event has been in dispatching.");
        }
        eventData.dispatchFlag = true;
        eventData.target = eventData.currentTarget = this;
        if (!eventData.stopPropagationFlag) {
            const { cow, listeners } = list;
            // Set copy-on-write flag.
            list.cow = true;
            // Call listeners.
            for (let i = 0; i < listeners.length; ++i) {
                const listener = listeners[i];
                // Skip if removed.
                if (isRemoved(listener)) {
                    continue;
                }
                // Remove this listener if has the `once` flag.
                if (isOnce(listener) && removeListenerAt(list, i, !cow)) {
                    // Because this listener was removed, the next index is the
                    // same as the current value.
                    i -= 1;
                }
                // Call this listener with the `passive` flag.
                eventData.inPassiveListenerFlag = isPassive(listener);
                invokeCallback(listener, this, event);
                eventData.inPassiveListenerFlag = false;
                // Stop if the `event.stopImmediatePropagation()` method was called.
                if (eventData.stopImmediatePropagationFlag) {
                    break;
                }
            }
            // Restore copy-on-write flag.
            if (!cow) {
                list.cow = false;
            }
        }
        eventData.target = null;
        eventData.currentTarget = null;
        eventData.stopImmediatePropagationFlag = false;
        eventData.stopPropagationFlag = false;
        eventData.dispatchFlag = false;
        return !eventData.canceledFlag;
    }
}
/**
 * Internal data.
 */
const internalDataMap$2 = new WeakMap();
/**
 * Get private data.
 * @param target The event target object to get private data.
 * @param name The variable name to report.
 * @returns The private data of the event.
 */
function $$2(target, name = "this") {
    const retv = internalDataMap$2.get(target);
    assertType(retv != null, "'%s' must be an object that EventTarget constructor created, but got another one: %o", name, target);
    return retv;
}
/**
 * Normalize options.
 * @param options The options to normalize.
 */
function normalizeAddOptions(type, callback, options) {
    var _a;
    assertCallback(callback);
    if (typeof options === "object" && options !== null) {
        return {
            type: String(type),
            callback: callback !== null && callback !== void 0 ? callback : undefined,
            capture: Boolean(options.capture),
            passive: Boolean(options.passive),
            once: Boolean(options.once),
            signal: (_a = options.signal) !== null && _a !== void 0 ? _a : undefined,
        };
    }
    return {
        type: String(type),
        callback: callback !== null && callback !== void 0 ? callback : undefined,
        capture: Boolean(options),
        passive: false,
        once: false,
        signal: undefined,
    };
}
/**
 * Normalize options.
 * @param options The options to normalize.
 */
function normalizeOptions(type, callback, options) {
    assertCallback(callback);
    if (typeof options === "object" && options !== null) {
        return {
            type: String(type),
            callback: callback !== null && callback !== void 0 ? callback : undefined,
            capture: Boolean(options.capture),
        };
    }
    return {
        type: String(type),
        callback: callback !== null && callback !== void 0 ? callback : undefined,
        capture: Boolean(options),
    };
}
/**
 * Assert the type of 'callback' argument.
 * @param callback The callback to check.
 */
function assertCallback(callback) {
    if (typeof callback === "function" ||
        (typeof callback === "object" &&
            callback !== null &&
            typeof callback.handleEvent === "function")) {
        return;
    }
    if (callback == null || typeof callback === "object") {
        InvalidEventListener.warn(callback);
        return;
    }
    throw new TypeError(format(InvalidEventListener.message, [callback]));
}
/**
 * Print warning for duplicated.
 * @param listener The current listener that is duplicated.
 * @param passive The passive flag of the new duplicated listener.
 * @param once The once flag of the new duplicated listener.
 * @param signal The signal object of the new duplicated listener.
 */
function warnDuplicate(listener, passive, once, signal) {
    EventListenerWasDuplicated.warn(isCapture(listener) ? "capture" : "bubble", listener.callback);
    if (isPassive(listener) !== passive) {
        OptionWasIgnored.warn("passive");
    }
    if (isOnce(listener) !== once) {
        OptionWasIgnored.warn("once");
    }
    if (listener.signal !== signal) {
        OptionWasIgnored.warn("signal");
    }
}
// Set enumerable
const keys$1$1 = Object.getOwnPropertyNames(EventTarget.prototype);
for (let i = 0; i < keys$1$1.length; ++i) {
    if (keys$1$1[i] === "constructor") {
        continue;
    }
    Object.defineProperty(EventTarget.prototype, keys$1$1[i], { enumerable: true });
}

function u(u,D){for(var t=0;t<D.length;t++){var F=D[t];F.enumerable=F.enumerable||!1,F.configurable=!0,"value"in F&&(F.writable=!0),Object.defineProperty(u,F.key,F);}}function D(D,t,F){return t&&u(D.prototype,t),F&&u(D,F),D}function t(u,D){(null==D||D>u.length)&&(D=u.length);for(var t=0,F=new Array(D);t<D;t++)F[t]=u[t];return F}function F(u,D){var F="undefined"!=typeof Symbol&&u[Symbol.iterator]||u["@@iterator"];if(F)return (F=F.call(u)).next.bind(F);if(Array.isArray(u)||(F=function(u,D){if(u){if("string"==typeof u)return t(u,D);var F=Object.prototype.toString.call(u).slice(8,-1);return "Object"===F&&u.constructor&&(F=u.constructor.name),"Map"===F||"Set"===F?Array.from(u):"Arguments"===F||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(F)?t(u,D):void 0}}(u))||D&&u&&"number"==typeof u.length){F&&(u=F);var e=0;return function(){return e>=u.length?{done:!0}:{done:!1,value:u[e++]}}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var e=/(?:[\$A-Z_a-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08C7\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\u9FFC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7CA\uA7F5-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD23\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF1C\uDF27\uDF30-\uDF45\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDEB8\uDF00-\uDF1A]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCDF\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDEE0-\uDEF2\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD4E\uDEC0-\uDEEB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43\uDD4B]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])/,C=/(?:[\$0-9A-Z_a-z\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05EF-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u07FD\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08C7\u08D3-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u09FE\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B55-\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D81-\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1878\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1ABF\u1AC0\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CD0-\u1CD2\u1CD4-\u1CFA\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\u9FFC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7CA\uA7F5-\uA827\uA82C\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD27\uDD30-\uDD39\uDE80-\uDEA9\uDEAB\uDEAC\uDEB0\uDEB1\uDF00-\uDF1C\uDF27\uDF30-\uDF50\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD44-\uDD47\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDC9-\uDDCC\uDDCE-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3B-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC5E-\uDC61\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDC00-\uDC3A\uDCA0-\uDCE9\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD35\uDD37\uDD38\uDD3B-\uDD43\uDD50-\uDD59\uDDA0-\uDDA7\uDDAA-\uDDD7\uDDDA-\uDDE1\uDDE3\uDDE4\uDE00-\uDE3E\uDE47\uDE50-\uDE99\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD8E\uDD90\uDD91\uDD93-\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF6\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF4F-\uDF87\uDF8F-\uDF9F\uDFE0\uDFE1\uDFE3\uDFE4\uDFF0\uDFF1]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A\uDD00-\uDD2C\uDD30-\uDD3D\uDD40-\uDD49\uDD4E\uDEC0-\uDEF9]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4B\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83E[\uDFF0-\uDFF9]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A]|\uDB40[\uDD00-\uDDEF])/;function A(u,D){return (D?/^[\x00-\xFF]*$/:/^[\x00-\x7F]*$/).test(u)}function E(u,D){void 0===D&&(D=!1);for(var t=[],F=0;F<u.length;){var E=u[F],n=function(e){if(!D)throw new TypeError(e);t.push({type:"INVALID_CHAR",index:F,value:u[F++]});};if("*"!==E)if("+"!==E&&"?"!==E)if("\\"!==E)if("{"!==E)if("}"!==E)if(":"!==E)if("("!==E)t.push({type:"CHAR",index:F,value:u[F++]});else {var r=1,i="",s=F+1,a=!1;if("?"===u[s]){n('Pattern cannot start with "?" at '+s);continue}for(;s<u.length;){if(!A(u[s],!1)){n("Invalid character '"+u[s]+"' at "+s+"."),a=!0;break}if("\\"!==u[s]){if(")"===u[s]){if(0==--r){s++;break}}else if("("===u[s]&&(r++,"?"!==u[s+1])){n("Capturing groups are not allowed at "+s),a=!0;break}i+=u[s++];}else i+=u[s++]+u[s++];}if(a)continue;if(r){n("Unbalanced pattern at "+F);continue}if(!i){n("Missing pattern at "+F);continue}t.push({type:"PATTERN",index:F,value:i}),F=s;}else {for(var B="",o=F+1;o<u.length;){var h=u.substr(o,1);if(!(o===F+1&&e.test(h)||o!==F+1&&C.test(h)))break;B+=u[o++];}if(!B){n("Missing parameter name at "+F);continue}t.push({type:"NAME",index:F,value:B}),F=o;}else t.push({type:"CLOSE",index:F,value:u[F++]});else t.push({type:"OPEN",index:F,value:u[F++]});else t.push({type:"ESCAPED_CHAR",index:F++,value:u[F++]});else t.push({type:"MODIFIER",index:F,value:u[F++]});else t.push({type:"ASTERISK",index:F,value:u[F++]});}return t.push({type:"END",index:F,value:""}),t}function n(u,D){void 0===D&&(D={});for(var t=E(u),F=D.prefixes,e=void 0===F?"./":F,C="[^"+r(D.delimiter||"/#?")+"]+?",A=[],n=0,i=0,s="",a=new Set,B=function(u){if(i<t.length&&t[i].type===u)return t[i++].value},o=function(){return B("MODIFIER")||B("ASTERISK")},h=function(u){var D=B(u);if(void 0!==D)return D;var F=t[i];throw new TypeError("Unexpected "+F.type+" at "+F.index+", expected "+u)},p=function(){for(var u,D="";u=B("CHAR")||B("ESCAPED_CHAR");)D+=u;return D},c=D.encodePart||function(u){return u};i<t.length;){var f=B("CHAR"),l=B("NAME"),m=B("PATTERN");if(l||m||!B("ASTERISK")||(m=".*"),l||m){var d=f||"";-1===e.indexOf(d)&&(s+=d,d=""),s&&(A.push(c(s)),s="");var g=l||n++;if(a.has(g))throw new TypeError("Duplicate name '"+g+"'.");a.add(g),A.push({name:g,prefix:c(d),suffix:"",pattern:m||C,modifier:o()||""});}else {var x=f||B("ESCAPED_CHAR");if(x)s+=x;else if(B("OPEN")){var S=p(),v=B("NAME")||"",y=B("PATTERN")||"";v||y||!B("ASTERISK")||(y=".*");var R=p();h("CLOSE");var k=o()||"";if(!v&&!y&&!k){s+=S;continue}if(!v&&!y&&!S)continue;s&&(A.push(c(s)),s=""),A.push({name:v||(y?n++:""),pattern:v&&!y?C:y,prefix:c(S),suffix:c(R),modifier:k});}else s&&(A.push(c(s)),s=""),h("END");}}return A}function r(u){return u.replace(/([.+*?^${}()[\]|/\\])/g,"\\$1")}function i(u){return u&&u.sensitive?"u":"ui"}function s(u,D,t){void 0===t&&(t={});for(var e,C=t.strict,A=void 0!==C&&C,E=t.start,n=void 0===E||E,s=t.end,a=void 0===s||s,B=t.encode,o=void 0===B?function(u){return u}:B,h="["+r(t.endsWith||"")+"]|$",p="["+r(t.delimiter||"/#?")+"]",c=n?"^":"",f=F(u);!(e=f()).done;){var l=e.value;if("string"==typeof l)c+=r(o(l));else {var m=r(o(l.prefix)),d=r(o(l.suffix));l.pattern?(D&&D.push(l),c+=m||d?"+"===l.modifier||"*"===l.modifier?"(?:"+m+"((?:"+l.pattern+")(?:"+d+m+"(?:"+l.pattern+"))*)"+d+")"+("*"===l.modifier?"?":""):"(?:"+m+"("+l.pattern+")"+d+")"+l.modifier:"+"===l.modifier||"*"===l.modifier?"((?:"+l.pattern+")"+l.modifier+")":"("+l.pattern+")"+l.modifier):c+="(?:"+m+d+")"+l.modifier;}}if(a)A||(c+=p+"?"),c+=t.endsWith?"(?="+h+")":"$";else {var g=u[u.length-1],x="string"==typeof g?p.indexOf(g[g.length-1])>-1:void 0===g;A||(c+="(?:"+p+"(?="+h+"))?"),x||(c+="(?="+p+"|"+h+")");}return new RegExp(c,i(t))}function a(u,D,t){return u instanceof RegExp?function(u,D){if(!D)return u;for(var t=/\((?:\?<(.*?)>)?(?!\?)/g,F=0,e=t.exec(u.source);e;)D.push({name:e[1]||F++,prefix:"",suffix:"",modifier:"",pattern:""}),e=t.exec(u.source);return u}(u,D):Array.isArray(u)?function(u,D,t){var F=u.map(function(u){return a(u,D,t).source});return new RegExp("(?:"+F.join("|")+")",i(t))}(u,D,t):function(u,D,t){return s(n(u,t),D,t)}(u,D,t)}var B={delimiter:"",prefixes:"",sensitive:!0,strict:!0},o={delimiter:".",prefixes:"",sensitive:!0,strict:!0},h={delimiter:"/",prefixes:"/",sensitive:!0,strict:!0};function p(u,D){return u.startsWith(D)?u.substring(D.length,u.length):u}function c(u){return !(!u||u.length<2||"["!==u[0]&&("\\"!==u[0]&&"{"!==u[0]||"["!==u[1]))}var f,l=["ftp","file","http","https","ws","wss"];function m(u){if(!u)return !0;for(var D,t=F(l);!(D=t()).done;)if(u.test(D.value))return !0;return !1}function d(u){switch(u){case"ws":case"http":return "80";case"wws":case"https":return "443";case"ftp":return "21";default:return ""}}function g(u){if(""===u)return u;if(/^[-+.A-Za-z0-9]*$/.test(u))return u.toLowerCase();throw new TypeError("Invalid protocol '"+u+"'.")}function x(u){if(""===u)return u;var D=new URL("https://example.com");return D.username=u,D.username}function S(u){if(""===u)return u;var D=new URL("https://example.com");return D.password=u,D.password}function v(u){if(""===u)return u;if(/[\t\n\r #%/:<>?@[\]^\\|]/g.test(u))throw new TypeError("Invalid hostname '"+u+"'");var D=new URL("https://example.com");return D.hostname=u,D.hostname}function y(u){if(""===u)return u;if(/[^0-9a-fA-F[\]:]/g.test(u))throw new TypeError("Invalid IPv6 hostname '"+u+"'");return u.toLowerCase()}function R(u){if(""===u)return u;if(/^[0-9]*$/.test(u)&&parseInt(u)<=65535)return u;throw new TypeError("Invalid port '"+u+"'.")}function k(u){if(""===u)return u;var D=new URL("https://example.com");return D.pathname="/"!==u[0]?"/-"+u:u,"/"!==u[0]?D.pathname.substring(2,D.pathname.length):D.pathname}function w(u){return ""===u?u:new URL("data:"+u).pathname}function P(u){if(""===u)return u;var D=new URL("https://example.com");return D.search=u,D.search.substring(1,D.search.length)}function T(u){if(""===u)return u;var D=new URL("https://example.com");return D.hash=u,D.hash.substring(1,D.hash.length)}!function(u){u[u.INIT=0]="INIT",u[u.PROTOCOL=1]="PROTOCOL",u[u.AUTHORITY=2]="AUTHORITY",u[u.USERNAME=3]="USERNAME",u[u.PASSWORD=4]="PASSWORD",u[u.HOSTNAME=5]="HOSTNAME",u[u.PORT=6]="PORT",u[u.PATHNAME=7]="PATHNAME",u[u.SEARCH=8]="SEARCH",u[u.HASH=9]="HASH",u[u.DONE=10]="DONE";}(f||(f={}));var b=function(){function u(u){this.input=void 0,this.tokenList=[],this.internalResult={},this.tokenIndex=0,this.tokenIncrement=1,this.componentStart=0,this.state=f.INIT,this.groupDepth=0,this.hostnameIPv6BracketDepth=0,this.shouldTreatAsStandardURL=!1,this.input=u;}var t=u.prototype;return t.parse=function(){for(this.tokenList=E(this.input,!0);this.tokenIndex<this.tokenList.length;this.tokenIndex+=this.tokenIncrement){if(this.tokenIncrement=1,"END"===this.tokenList[this.tokenIndex].type){if(this.state===f.INIT){this.rewind(),this.isHashPrefix()?this.changeState(f.HASH,1):this.isSearchPrefix()?(this.changeState(f.SEARCH,1),this.internalResult.hash=""):(this.changeState(f.PATHNAME,0),this.internalResult.search="",this.internalResult.hash="");continue}if(this.state===f.AUTHORITY){this.rewindAndSetState(f.HOSTNAME);continue}this.changeState(f.DONE,0);break}if(this.groupDepth>0){if(!this.isGroupClose())continue;this.groupDepth-=1;}if(this.isGroupOpen())this.groupDepth+=1;else switch(this.state){case f.INIT:this.isProtocolSuffix()&&(this.internalResult.username="",this.internalResult.password="",this.internalResult.hostname="",this.internalResult.port="",this.internalResult.pathname="",this.internalResult.search="",this.internalResult.hash="",this.rewindAndSetState(f.PROTOCOL));break;case f.PROTOCOL:if(this.isProtocolSuffix()){this.computeShouldTreatAsStandardURL();var u=f.PATHNAME,D=1;this.shouldTreatAsStandardURL&&(this.internalResult.pathname="/"),this.nextIsAuthoritySlashes()?(u=f.AUTHORITY,D=3):this.shouldTreatAsStandardURL&&(u=f.AUTHORITY),this.changeState(u,D);}break;case f.AUTHORITY:this.isIdentityTerminator()?this.rewindAndSetState(f.USERNAME):(this.isPathnameStart()||this.isSearchPrefix()||this.isHashPrefix())&&this.rewindAndSetState(f.HOSTNAME);break;case f.USERNAME:this.isPasswordPrefix()?this.changeState(f.PASSWORD,1):this.isIdentityTerminator()&&this.changeState(f.HOSTNAME,1);break;case f.PASSWORD:this.isIdentityTerminator()&&this.changeState(f.HOSTNAME,1);break;case f.HOSTNAME:this.isIPv6Open()?this.hostnameIPv6BracketDepth+=1:this.isIPv6Close()&&(this.hostnameIPv6BracketDepth-=1),this.isPortPrefix()&&!this.hostnameIPv6BracketDepth?this.changeState(f.PORT,1):this.isPathnameStart()?this.changeState(f.PATHNAME,0):this.isSearchPrefix()?this.changeState(f.SEARCH,1):this.isHashPrefix()&&this.changeState(f.HASH,1);break;case f.PORT:this.isPathnameStart()?this.changeState(f.PATHNAME,0):this.isSearchPrefix()?this.changeState(f.SEARCH,1):this.isHashPrefix()&&this.changeState(f.HASH,1);break;case f.PATHNAME:this.isSearchPrefix()?this.changeState(f.SEARCH,1):this.isHashPrefix()&&this.changeState(f.HASH,1);break;case f.SEARCH:this.isHashPrefix()&&this.changeState(f.HASH,1);}}},t.changeState=function(u,D){switch(this.state){case f.INIT:break;case f.PROTOCOL:this.internalResult.protocol=this.makeComponentString();break;case f.AUTHORITY:break;case f.USERNAME:this.internalResult.username=this.makeComponentString();break;case f.PASSWORD:this.internalResult.password=this.makeComponentString();break;case f.HOSTNAME:this.internalResult.hostname=this.makeComponentString();break;case f.PORT:this.internalResult.port=this.makeComponentString();break;case f.PATHNAME:this.internalResult.pathname=this.makeComponentString();break;case f.SEARCH:this.internalResult.search=this.makeComponentString();break;case f.HASH:this.internalResult.hash=this.makeComponentString();}this.changeStateWithoutSettingComponent(u,D);},t.changeStateWithoutSettingComponent=function(u,D){this.state=u,this.componentStart=this.tokenIndex+D,this.tokenIndex+=D,this.tokenIncrement=0;},t.rewind=function(){this.tokenIndex=this.componentStart,this.tokenIncrement=0;},t.rewindAndSetState=function(u){this.rewind(),this.state=u;},t.safeToken=function(u){return u<0&&(u=this.tokenList.length-u),u<this.tokenList.length?this.tokenList[u]:this.tokenList[this.tokenList.length-1]},t.isNonSpecialPatternChar=function(u,D){var t=this.safeToken(u);return t.value===D&&("CHAR"===t.type||"ESCAPED_CHAR"===t.type||"INVALID_CHAR"===t.type)},t.isProtocolSuffix=function(){return this.isNonSpecialPatternChar(this.tokenIndex,":")},t.nextIsAuthoritySlashes=function(){return this.isNonSpecialPatternChar(this.tokenIndex+1,"/")&&this.isNonSpecialPatternChar(this.tokenIndex+2,"/")},t.isIdentityTerminator=function(){return this.isNonSpecialPatternChar(this.tokenIndex,"@")},t.isPasswordPrefix=function(){return this.isNonSpecialPatternChar(this.tokenIndex,":")},t.isPortPrefix=function(){return this.isNonSpecialPatternChar(this.tokenIndex,":")},t.isPathnameStart=function(){return this.isNonSpecialPatternChar(this.tokenIndex,"/")},t.isSearchPrefix=function(){if(this.isNonSpecialPatternChar(this.tokenIndex,"?"))return !0;if("?"!==this.tokenList[this.tokenIndex].value)return !1;var u=this.safeToken(this.tokenIndex-1);return "NAME"!==u.type&&"PATTERN"!==u.type&&"CLOSE"!==u.type&&"ASTERISK"!==u.type},t.isHashPrefix=function(){return this.isNonSpecialPatternChar(this.tokenIndex,"#")},t.isGroupOpen=function(){return "OPEN"==this.tokenList[this.tokenIndex].type},t.isGroupClose=function(){return "CLOSE"==this.tokenList[this.tokenIndex].type},t.isIPv6Open=function(){return this.isNonSpecialPatternChar(this.tokenIndex,"[")},t.isIPv6Close=function(){return this.isNonSpecialPatternChar(this.tokenIndex,"]")},t.makeComponentString=function(){var u=this.tokenList[this.tokenIndex],D=this.safeToken(this.componentStart).index;return this.input.substring(D,u.index)},t.computeShouldTreatAsStandardURL=function(){var u={};Object.assign(u,B),u.encodePart=g;var D=a(this.makeComponentString(),void 0,u);this.shouldTreatAsStandardURL=m(D);},D(u,[{key:"result",get:function(){return this.internalResult}}]),u}(),I=["protocol","username","password","hostname","port","pathname","search","hash"];function O(u,D){if("string"!=typeof u)throw new TypeError("parameter 1 is not of type 'string'.");var t=new URL(u,D);return {protocol:t.protocol.substring(0,t.protocol.length-1),username:t.username,password:t.password,hostname:t.hostname,port:t.port,pathname:t.pathname,search:""!=t.search?t.search.substring(1,t.search.length):void 0,hash:""!=t.hash?t.hash.substring(1,t.hash.length):void 0}}function H(u,D,t){var F;if("string"==typeof D.baseURL)try{F=new URL(D.baseURL),u.protocol=F.protocol?F.protocol.substring(0,F.protocol.length-1):"",u.username=F.username,u.password=F.password,u.hostname=F.hostname,u.port=F.port,u.pathname=F.pathname,u.search=F.search?F.search.substring(1,F.search.length):"",u.hash=F.hash?F.hash.substring(1,F.hash.length):"";}catch(u){throw new TypeError("invalid baseURL '"+D.baseURL+"'.")}if("string"==typeof D.protocol&&(u.protocol=function(u,D){var t;return u=(t=u).endsWith(":")?t.substr(0,t.length-":".length):t,D||""===u?u:g(u)}(D.protocol,t)),"string"==typeof D.username&&(u.username=function(u,D){if(D||""===u)return u;var t=new URL("https://example.com");return t.username=u,t.username}(D.username,t)),"string"==typeof D.password&&(u.password=function(u,D){if(D||""===u)return u;var t=new URL("https://example.com");return t.password=u,t.password}(D.password,t)),"string"==typeof D.hostname&&(u.hostname=function(u,D){return D||""===u?u:c(u)?y(u):v(u)}(D.hostname,t)),"string"==typeof D.port&&(u.port=function(u,D,t){return d(D)===u&&(u=""),t||""===u?u:R(u)}(D.port,u.protocol,t)),"string"==typeof D.pathname){if(u.pathname=D.pathname,F&&!function(u,D){return !(!u.length||"/"!==u[0]&&(!D||u.length<2||"\\"!=u[0]&&"{"!=u[0]||"/"!=u[1]))}(u.pathname,t)){var e=F.pathname.lastIndexOf("/");e>=0&&(u.pathname=F.pathname.substring(0,e+1)+u.pathname);}u.pathname=function(u,D,t){if(t||""===u)return u;if(D&&!l.includes(D))return new URL(D+":"+u).pathname;var F="/"==u[0];return u=new URL(F?u:"/-"+u,"https://example.com").pathname,F||(u=u.substring(2,u.length)),u}(u.pathname,u.protocol,t);}return "string"==typeof D.search&&(u.search=function(u,D){if(u=p(u,"?"),D||""===u)return u;var t=new URL("https://example.com");return t.search=u,t.search?t.search.substring(1,t.search.length):""}(D.search,t)),"string"==typeof D.hash&&(u.hash=function(u,D){if(u=p(u,"#"),D||""===u)return u;var t=new URL("https://example.com");return t.hash=u,t.hash?t.hash.substring(1,t.hash.length):""}(D.hash,t)),u}function N(u){return u.replace(/([+*?:{}()\\])/g,"\\$1")}function L(u,D){for(var t="[^"+(D.delimiter||"/#?").replace(/([.+*?^${}()[\]|/\\])/g,"\\$1")+"]+?",F=/(?:[\$0-9A-Z_a-z\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05EF-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u07FD\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08C7\u08D3-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u09FE\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B55-\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D81-\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1878\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1ABF\u1AC0\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CD0-\u1CD2\u1CD4-\u1CFA\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\u9FFC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7CA\uA7F5-\uA827\uA82C\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDD00-\uDD27\uDD30-\uDD39\uDE80-\uDEA9\uDEAB\uDEAC\uDEB0\uDEB1\uDF00-\uDF1C\uDF27\uDF30-\uDF50\uDFB0-\uDFC4\uDFE0-\uDFF6]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD44-\uDD47\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDC9-\uDDCC\uDDCE-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3B-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC5E-\uDC61\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDC00-\uDC3A\uDCA0-\uDCE9\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD35\uDD37\uDD38\uDD3B-\uDD43\uDD50-\uDD59\uDDA0-\uDDA7\uDDAA-\uDDD7\uDDDA-\uDDE1\uDDE3\uDDE4\uDE00-\uDE3E\uDE47\uDE50-\uDE99\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD8E\uDD90\uDD91\uDD93-\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF6\uDFB0]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE7F\uDF00-\uDF4A\uDF4F-\uDF87\uDF8F-\uDF9F\uDFE0\uDFE1\uDFE3\uDFE4\uDFF0\uDFF1]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A\uDD00-\uDD2C\uDD30-\uDD3D\uDD40-\uDD49\uDD4E\uDEC0-\uDEF9]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4B\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83E[\uDFF0-\uDFF9]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A]|\uDB40[\uDD00-\uDDEF])/,e="",C=0;C<u.length;++C){var A=u[C],E=C>0?u[C-1]:null,n=C<u.length-1?u[C+1]:null;if("string"!=typeof A)if(""!==A.pattern){var r="number"!=typeof A.name,i=void 0!==D.prefixes?D.prefixes:"./",s=""!==A.suffix||""!==A.prefix&&(1!==A.prefix.length||!i.includes(A.prefix));s||!r||A.pattern!==t||""!==A.modifier||!n||n.prefix||n.suffix||(s="string"==typeof n?F.test(n.length>0?n[0]:""):"number"==typeof n.name),!s&&""===A.prefix&&E&&"string"==typeof E&&E.length>0&&(s=i.includes(E[E.length-1])),s&&(e+="{"),e+=N(A.prefix),r&&(e+=":"+A.name),".*"===A.pattern?e+=r||E&&"string"!=typeof E&&!E.modifier&&!s&&""===A.prefix?"(.*)":"*":A.pattern===t?r||(e+="("+t+")"):e+="("+A.pattern+")",A.pattern===t&&r&&""!==A.suffix&&F.test(A.suffix[0])&&(e+="\\"),e+=N(A.suffix),s&&(e+="}"),e+=A.modifier;}else {if(""===A.modifier){e+=N(A.prefix);continue}e+="{"+N(A.prefix)+"}"+A.modifier;}else e+=N(A);}return e}var U=function(){function u(u,D){void 0===u&&(u={}),this.pattern=void 0,this.regexp={},this.keys={},this.component_pattern={};try{if("string"==typeof u){var t=new b(u);if(t.parse(),u=t.result,D){if("string"!=typeof D)throw new TypeError("'baseURL' parameter is not of type 'string'.");u.baseURL=D;}else if("string"!=typeof u.protocol)throw new TypeError("A base URL must be provided for a relative constructor string.")}else if(D)throw new TypeError("parameter 1 is not of type 'string'.");if(!u||"object"!=typeof u)throw new TypeError("parameter 1 is not of type 'string' and cannot convert to dictionary.");var e;this.pattern=H({pathname:"*",protocol:"*",username:"*",password:"*",hostname:"*",port:"*",search:"*",hash:"*"},u,!0),d(this.pattern.protocol)===this.pattern.port&&(this.pattern.port="");for(var C,A=F(I);!(C=A()).done;)if((e=C.value)in this.pattern){var E={},r=this.pattern[e];switch(this.keys[e]=[],e){case"protocol":Object.assign(E,B),E.encodePart=g;break;case"username":Object.assign(E,B),E.encodePart=x;break;case"password":Object.assign(E,B),E.encodePart=S;break;case"hostname":Object.assign(E,o),E.encodePart=c(r)?y:v;break;case"port":Object.assign(E,B),E.encodePart=R;break;case"pathname":m(this.regexp.protocol)?(Object.assign(E,h),E.encodePart=k):(Object.assign(E,B),E.encodePart=w);break;case"search":Object.assign(E,B),E.encodePart=P;break;case"hash":Object.assign(E,B),E.encodePart=T;}try{var i=n(r,E);this.regexp[e]=s(i,this.keys[e],E),this.component_pattern[e]=L(i,E);}catch(u){throw new TypeError("invalid "+e+" pattern '"+this.pattern[e]+"'.")}}}catch(u){throw new TypeError("Failed to construct 'URLPattern': "+u.message)}}var t=u.prototype;return t.test=function(u,D){void 0===u&&(u={});var t,F={pathname:"",protocol:"",username:"",password:"",hostname:"",port:"",search:"",hash:""};if("string"!=typeof u&&D)throw new TypeError("parameter 1 is not of type 'string'.");if(void 0===u)return !1;try{F=H(F,"object"==typeof u?u:O(u,D),!1);}catch(u){return !1}for(t in this.pattern)if(!this.regexp[t].exec(F[t]))return !1;return !0},t.exec=function(u,D){void 0===u&&(u={});var t={pathname:"",protocol:"",username:"",password:"",hostname:"",port:"",search:"",hash:""};if("string"!=typeof u&&D)throw new TypeError("parameter 1 is not of type 'string'.");if(void 0!==u){try{t=H(t,"object"==typeof u?u:O(u,D),!1);}catch(u){return null}var e,C={};for(e in C.inputs=D?[u,D]:[u],this.pattern){var A=this.regexp[e].exec(t[e]);if(!A)return null;for(var E,n={},r=F(this.keys[e].entries());!(E=r()).done;){var i=E.value,s=i[1];"string"!=typeof s.name&&"number"!=typeof s.name||(n[s.name]=A[i[0]+1]||"");}C[e]={input:t[e]||"",groups:n};}return C}},D(u,[{key:"protocol",get:function(){return this.component_pattern.protocol}},{key:"username",get:function(){return this.component_pattern.username}},{key:"password",get:function(){return this.component_pattern.password}},{key:"hostname",get:function(){return this.component_pattern.hostname}},{key:"port",get:function(){return this.component_pattern.port}},{key:"pathname",get:function(){return this.component_pattern.pathname}},{key:"search",get:function(){return this.component_pattern.search}},{key:"hash",get:function(){return this.component_pattern.hash}}]),u}();

const INTERNAL$2 = { tick: 0, pool: new Map() };
function requestAnimationFrame(callback) {
    if (!INTERNAL$2.pool.size) {
        setTimeout$1(() => {
            const next = __performance_now();
            for (const func of INTERNAL$2.pool.values()) {
                func(next);
            }
            INTERNAL$2.pool.clear();
        }, 1000 / 16);
    }
    const func = __function_bind(callback, undefined);
    const tick = ++INTERNAL$2.tick;
    INTERNAL$2.pool.set(tick, func);
    return tick;
}
function cancelAnimationFrame(requestId) {
    const timeout = INTERNAL$2.pool.get(requestId);
    if (timeout) {
        clearTimeout$1(timeout);
        INTERNAL$2.pool.delete(requestId);
    }
}

class Node extends EventTarget {
    append(...nodesOrDOMStrings) {
    }
    appendChild(childNode) {
        return childNode;
    }
    after(...nodesOrDOMStrings) {
    }
    before(...nodesOrDOMStrings) {
    }
    prepend(...nodesOrDOMStrings) {
    }
    replaceChild(newChild, oldChild) {
        return oldChild;
    }
    removeChild(childNode) {
        return childNode;
    }
    get attributes() {
        return {};
    }
    get childNodes() {
        return [];
    }
    get children() {
        return [];
    }
    get ownerDocument() {
        return null;
    }
    get nodeValue() {
        return '';
    }
    set nodeValue(value) {
    }
    get textContent() {
        return '';
    }
    set textContent(value) {
    }
    get previousElementSibling() {
        return null;
    }
    get nextElementSibling() {
        return null;
    }
    [Symbol.for('nodejs.util.inspect.custom')](depth, options) {
        return `${this.constructor.name}`;
    }
}
class DocumentFragment extends Node {
}
class ShadowRoot extends DocumentFragment {
    get innerHTML() {
        return '';
    }
    set innerHTML(value) {
    }
}
const NodeFilter$1 = Object.assign({
    NodeFilter() {
        throw new TypeError('Illegal constructor');
    },
}.NodeFilter, {
    FILTER_ACCEPT: 1,
    FILTER_REJECT: 2,
    FILTER_SKIP: 3,
    SHOW_ALL: 4294967295,
    SHOW_ELEMENT: 1,
    SHOW_ATTRIBUTE: 2,
    SHOW_TEXT: 4,
    SHOW_CDATA_SECTION: 8,
    SHOW_ENTITY_REFERENCE: 16,
    SHOW_ENTITY: 32,
    SHOW_PROCESSING_INSTRUCTION: 64,
    SHOW_COMMENT: 128,
    SHOW_DOCUMENT: 256,
    SHOW_DOCUMENT_TYPE: 512,
    SHOW_DOCUMENT_FRAGMENT: 1024,
    SHOW_NOTATION: 2048,
});
class NodeIterator$1 {
    nextNode() {
        return null;
    }
    previousNode() {
        return null;
    }
    get filter() {
        const internals = internalsOf(this, 'NodeIterator', 'filter');
        return internals.filter;
    }
    get pointerBeforeReferenceNode() {
        const internals = internalsOf(this, 'NodeIterator', 'pointerBeforeReferenceNode');
        return internals.pointerBeforeReferenceNode;
    }
    get referenceNode() {
        const internals = internalsOf(this, 'NodeIterator', 'referenceNode');
        return internals.referenceNode;
    }
    get root() {
        const internals = internalsOf(this, 'NodeIterator', 'root');
        return internals.root;
    }
    get whatToShow() {
        const internals = internalsOf(this, 'NodeIterator', 'whatToShow');
        return internals.whatToShow;
    }
}
allowStringTag(Node);
allowStringTag(NodeIterator$1);
allowStringTag(DocumentFragment);
allowStringTag(ShadowRoot);

class CharacterData extends Node {
    constructor(data) {
        INTERNALS.set(super(), {
            data: String(data),
        });
    }
    get data() {
        return internalsOf(this, 'CharacterData', 'data')
            .data;
    }
    get textContent() {
        return internalsOf(this, 'CharacterData', 'textContent').data;
    }
}
class Comment extends CharacterData {
}
class Text extends CharacterData {
    get assignedSlot() {
        return null;
    }
    get wholeText() {
        return internalsOf(this, 'CharacterData', 'textContent').data;
    }
}
allowStringTag(CharacterData);
allowStringTag(Text);
allowStringTag(Comment);

class CustomEvent extends Event {
    constructor(type, params) {
        params = Object(params);
        super(type, params);
        if ('detail' in params)
            this.detail = params.detail;
    }
}
allowStringTag(CustomEvent);

const INTERNAL$1 = { tick: 0, pool: new Map() };
function requestIdleCallback(callback) {
    if (!INTERNAL$1.pool.size) {
        setTimeout$1(() => {
            const next = __performance_now();
            for (const func of INTERNAL$1.pool.values()) {
                func(next);
            }
            INTERNAL$1.pool.clear();
        }, 1000 / 16);
    }
    const func = __function_bind(callback, undefined);
    const tick = ++INTERNAL$1.tick;
    INTERNAL$1.pool.set(tick, func);
    return tick;
}
function cancelIdleCallback(requestId) {
    const timeout = INTERNAL$1.pool.get(requestId);
    if (timeout) {
        clearTimeout$1(timeout);
        INTERNAL$1.pool.delete(requestId);
    }
}

const INTERNAL = { tick: 0, pool: new Map() };
function setTimeout(callback, delay = 0, ...args) {
    const func = __function_bind(callback, globalThis);
    const tick = ++INTERNAL.tick;
    const timeout = setTimeout$1(func, delay, ...args);
    INTERNAL.pool.set(tick, timeout);
    return tick;
}
function clearTimeout(timeoutId) {
    const timeout = INTERNAL.pool.get(timeoutId);
    if (timeout) {
        clearTimeout$1(timeout);
        INTERNAL.pool.delete(timeoutId);
    }
}

class TreeWalker {
    parentNode() {
        return null;
    }
    firstChild() {
        return null;
    }
    lastChild() {
        return null;
    }
    previousSibling() {
        return null;
    }
    nextSibling() {
        return null;
    }
    previousNode() {
        return null;
    }
    nextNode() {
        return null;
    }
    get currentNode() {
        const internals = internalsOf(this, 'TreeWalker', 'currentNode');
        return internals.currentNode;
    }
    get root() {
        const internals = internalsOf(this, 'TreeWalker', 'root');
        return internals.root;
    }
    get whatToShow() {
        const internals = internalsOf(this, 'TreeWalker', 'whatToShow');
        return internals.whatToShow;
    }
}
allowStringTag(TreeWalker);

const PRIMITIVE  = 0;
const ARRAY      = 1;
const OBJECT     = 2;
const DATE       = 3;
const REGEXP     = 4;
const MAP        = 5;
const SET        = 6;
const ERROR      = 7;
const BIGINT     = 8;
// export const SYMBOL = 9;

const env = typeof self === 'object' ? self : globalThis;

const deserializer = ($, _) => {
  const as = (out, index) => {
    $.set(index, out);
    return out;
  };

  const unpair = index => {
    if ($.has(index))
      return $.get(index);

    const [type, value] = _[index];
    switch (type) {
      case PRIMITIVE:
        return as(value, index);
      case ARRAY: {
        const arr = as([], index);
        for (const index of value)
          arr.push(unpair(index));
        return arr;
      }
      case OBJECT: {
        const object = as({}, index);
        for (const [key, index] of value)
          object[unpair(key)] = unpair(index);
        return object;
      }
      case DATE:
        return as(new Date(value), index);
      case REGEXP: {
        const {source, flags} = value;
        return as(new RegExp(source, flags), index);
      }
      case MAP: {
        const map = as(new Map, index);
        for (const [key, index] of value)
          map.set(unpair(key), unpair(index));
        return map;
      }
      case SET: {
        const set = as(new Set, index);
        for (const index of value)
          set.add(unpair(index));
        return set;
      }
      case ERROR: {
        const {name, message} = value;
        return as(new env[name](message), index);
      }
      case BIGINT:
        return as(BigInt(value), index);
      case 'BigInt':
        return as(Object(BigInt(value)), index);
    }
    return as(new env[type](value), index);
  };

  return unpair;
};

/**
 * @typedef {Array<string,any>} Record a type representation
 */

/**
 * Returns a deserialized value from a serialized array of Records.
 * @param {Record[]} serialized a previously serialized value.
 * @returns {any}
 */
const deserialize = serialized => deserializer(new Map, serialized)(0);

const EMPTY = '';

const {toString} = {};
const {keys} = Object;

const typeOf = value => {
  const type = typeof value;
  if (type !== 'object' || !value)
    return [PRIMITIVE, type];

  const asString = toString.call(value).slice(8, -1);
  switch (asString) {
    case 'Array':
      return [ARRAY, EMPTY];
    case 'Object':
      return [OBJECT, EMPTY];
    case 'Date':
      return [DATE, EMPTY];
    case 'RegExp':
      return [REGEXP, EMPTY];
    case 'Map':
      return [MAP, EMPTY];
    case 'Set':
      return [SET, EMPTY];
  }

  if (asString.includes('Array'))
    return [ARRAY, asString];

  if (asString.includes('Error'))
    return [ERROR, asString];

  return [OBJECT, asString];
};

const shouldSkip = ([TYPE, type]) => (
  TYPE === PRIMITIVE &&
  (type === 'function' || type === 'symbol')
);

const serializer = (strict, json, $, _) => {

  const as = (out, value) => {
    const index = _.push(out) - 1;
    $.set(value, index);
    return index;
  };

  const pair = value => {
    if ($.has(value))
      return $.get(value);

    let [TYPE, type] = typeOf(value);
    switch (TYPE) {
      case PRIMITIVE: {
        let entry = value;
        switch (type) {
          case 'bigint':
            TYPE = BIGINT;
            entry = value.toString();
            break;
          case 'function':
          case 'symbol':
            if (strict)
              throw new TypeError('unable to serialize ' + type);
            entry = null;
            break;
        }
        return as([TYPE, entry], value);
      }
      case ARRAY: {
        if (type)
          return as([type, [...value]], value);
  
        const arr = [];
        const index = as([TYPE, arr], value);
        for (const entry of value)
          arr.push(pair(entry));
        return index;
      }
      case OBJECT: {
        if (type) {
          switch (type) {
            case 'BigInt':
              return as([type, value.toString()], value);
            case 'Boolean':
            case 'Number':
            case 'String':
              return as([type, value.valueOf()], value);
          }
        }

        if (json && ('toJSON' in value))
          return pair(value.toJSON());

        const entries = [];
        const index = as([TYPE, entries], value);
        for (const key of keys(value)) {
          if (strict || !shouldSkip(typeOf(value[key])))
            entries.push([pair(key), pair(value[key])]);
        }
        return index;
      }
      case DATE:
        return as([TYPE, value.toISOString()], value);
      case REGEXP: {
        const {source, flags} = value;
        return as([TYPE, {source, flags}], value);
      }
      case MAP: {
        const entries = [];
        const index = as([TYPE, entries], value);
        for (const [key, entry] of value) {
          if (strict || !(shouldSkip(typeOf(key)) || shouldSkip(typeOf(entry))))
            entries.push([pair(key), pair(entry)]);
        }
        return index;
      }
      case SET: {
        const entries = [];
        const index = as([TYPE, entries], value);
        for (const entry of value) {
          if (strict || !shouldSkip(typeOf(entry)))
            entries.push(pair(entry));
        }
        return index;
      }
    }

    const {message} = value;
    return as([TYPE, {name: type, message}], value);
  };

  return pair;
};

/**
 * @typedef {Array<string,any>} Record a type representation
 */

/**
 * Returns an array of serialized Records.
 * @param {any} value a serializable value.
 * @param {{lossy?: boolean}?} options an object with a `lossy` property that,
 *  if `true`, will not throw errors on incompatible types, and behave more
 *  like JSON stringify would behave. Symbol and Function will be discarded.
 * @returns {Record[]}
 */
 const serialize = (value, {json, lossy} = {}) => {
  const _ = [];
  return serializer(!(json || lossy), !!json, new Map, _)(value), _;
};

var structuredClone = (any, options) => deserialize(serialize(any, options));

class ImageData {
    constructor(arg0, arg1, ...args) {
        if (arguments.length < 2)
            throw new TypeError(`Failed to construct 'ImageData': 2 arguments required.`);
        /** Whether Uint8ClampedArray data is provided. */
        const hasData = __object_isPrototypeOf(Uint8ClampedArray.prototype, arg0);
        /** Image data, either provided or calculated. */
        const d = hasData
            ? arg0
            : new Uint8ClampedArray(asNumber(arg0, 'width') * asNumber(arg1, 'height') * 4);
        /** Image width. */
        const w = asNumber(hasData ? arg1 : arg0, 'width');
        /** Image height. */
        const h = d.length / w / 4;
        /** Image color space. */
        const c = String(Object(hasData ? args[1] : args[0]).colorSpace || 'srgb');
        // throw if a provided height does not match the calculated height
        if (args.length && asNumber(args[0], 'height') !== h)
            throw new DOMException('height is not equal to (4 * width * height)', 'IndexSizeError');
        // throw if a provided colorspace does not match a known colorspace
        if (c !== 'srgb' && c !== 'rec2020' && c !== 'display-p3')
            throw new TypeError('colorSpace is not known value');
        Object.defineProperty(this, 'data', {
            configurable: true,
            enumerable: true,
            value: d,
        });
        INTERNALS.set(this, {
            width: w,
            height: h,
            colorSpace: c,
        });
    }
    get data() {
        internalsOf(this, 'ImageData', 'data');
        return Object.getOwnPropertyDescriptor(this, 'data').value;
    }
    get width() {
        return internalsOf(this, 'ImageData', 'width').width;
    }
    get height() {
        return internalsOf(this, 'ImageData', 'height').height;
    }
}
allowStringTag(ImageData);
/** Returns a coerced number, optionally throwing if the number is zero-ish. */
const asNumber = (value, axis) => {
    value = Number(value) || 0;
    if (value === 0)
        throw new TypeError(`The source ${axis} is zero or not a number.`);
    return value;
};

class CanvasRenderingContext2D {
    get canvas() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'canvas').canvas;
    }
    get direction() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'direction')
            .direction;
    }
    get fillStyle() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'fillStyle')
            .fillStyle;
    }
    get filter() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'filter').filter;
    }
    get globalAlpha() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'globalAlpha')
            .globalAlpha;
    }
    get globalCompositeOperation() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'globalCompositeOperation').globalCompositeOperation;
    }
    get font() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'font').font;
    }
    get imageSmoothingEnabled() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'imageSmoothingEnabled').imageSmoothingEnabled;
    }
    get imageSmoothingQuality() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'imageSmoothingQuality').imageSmoothingQuality;
    }
    get lineCap() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'lineCap').lineCap;
    }
    get lineDashOffset() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'lineDashOffset')
            .lineDashOffset;
    }
    get lineJoin() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'lineJoin').lineJoin;
    }
    get lineWidth() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'lineWidth')
            .lineWidth;
    }
    get miterLimit() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'miterLimit')
            .miterLimit;
    }
    get strokeStyle() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'strokeStyle')
            .strokeStyle;
    }
    get shadowOffsetX() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'shadowOffsetX')
            .shadowOffsetX;
    }
    get shadowOffsetY() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'shadowOffsetY')
            .shadowOffsetY;
    }
    get shadowBlur() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'shadowBlur')
            .shadowBlur;
    }
    get shadowColor() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'shadowColor')
            .shadowColor;
    }
    get textAlign() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'textAlign')
            .textAlign;
    }
    get textBaseline() {
        return internalsOf(this, 'CanvasRenderingContext2D', 'textBaseline')
            .textBaseline;
    }
    arc() { }
    arcTo() { }
    beginPath() { }
    bezierCurveTo() { }
    clearRect() { }
    clip() { }
    closePath() { }
    createImageData(arg0, arg1) {
        /** Whether ImageData is provided. */
        const hasData = __object_isPrototypeOf(ImageData.prototype, arg0);
        const w = hasData ? arg0.width : arg0;
        const h = hasData ? arg0.height : arg1;
        const d = hasData
            ? arg0.data
            : new Uint8ClampedArray(w * h * 4);
        return new ImageData(d, w, h);
    }
    createLinearGradient() { }
    createPattern() { }
    createRadialGradient() { }
    drawFocusIfNeeded() { }
    drawImage() { }
    ellipse() { }
    fill() { }
    fillRect() { }
    fillText() { }
    getContextAttributes() { }
    getImageData() { }
    getLineDash() { }
    getTransform() { }
    isPointInPath() { }
    isPointInStroke() { }
    lineTo() { }
    measureText() { }
    moveTo() { }
    putImageData() { }
    quadraticCurveTo() { }
    rect() { }
    resetTransform() { }
    restore() { }
    rotate() { }
    save() { }
    scale() { }
    setLineDash() { }
    setTransform() { }
    stroke() { }
    strokeRect() { }
    strokeText() { }
    transform() { }
    translate() { }
}
allowStringTag(CanvasRenderingContext2D);
const __createCanvasRenderingContext2D = (canvas) => {
    const renderingContext2D = Object.create(CanvasRenderingContext2D.prototype);
    INTERNALS.set(renderingContext2D, {
        canvas,
        direction: 'inherit',
        fillStyle: '#000',
        filter: 'none',
        font: '10px sans-serif',
        globalAlpha: 0,
        globalCompositeOperation: 'source-over',
        imageSmoothingEnabled: false,
        imageSmoothingQuality: 'high',
        lineCap: 'butt',
        lineDashOffset: 0.0,
        lineJoin: 'miter',
        lineWidth: 1.0,
        miterLimit: 10.0,
        shadowBlur: 0,
        shadowColor: '#000',
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        strokeStyle: '#000',
        textAlign: 'start',
        textBaseline: 'alphabetic',
    });
    return renderingContext2D;
};

class CustomElementRegistry {
    /** Defines a new custom element using the given tag name and HTMLElement constructor. */
    define(name, constructor, options) {
        const internals = internalsOf(this, 'CustomElementRegistry', 'define');
        name = String(name);
        if (/[A-Z]/.test(name))
            throw new SyntaxError('Custom element name cannot contain an uppercase ASCII letter');
        if (!/^[a-z]/.test(name))
            throw new SyntaxError('Custom element name must have a lowercase ASCII letter as its first character');
        if (!/-/.test(name))
            throw new SyntaxError('Custom element name must contain a hyphen');
        INTERNALS.set(constructor, {
            attributes: {},
            localName: name,
        });
        internals.constructorByName.set(name, constructor);
        internals.nameByConstructor.set(constructor, name);
    }
    /** Returns the constructor associated with the given tag name. */
    get(name) {
        const internals = internalsOf(this, 'CustomElementRegistry', 'get');
        name = String(name).toLowerCase();
        return internals.constructorByName.get(name);
    }
    getName(constructor) {
        const internals = internalsOf(this, 'CustomElementRegistry', 'getName');
        return internals.nameByConstructor.get(constructor);
    }
}
allowStringTag(CustomElementRegistry);
const initCustomElementRegistry = (target, exclude) => {
    if (exclude.has('customElements'))
        return;
    const CustomElementRegistry = target.CustomElementRegistry || globalThis.CustomElementRegistry;
    const customElements = target.customElements ||
        (target.customElements = new CustomElementRegistry());
    INTERNALS.set(customElements, {
        constructorByName: new Map(),
        nameByConstructor: new Map(),
    });
};

class Element extends Node {
    constructor() {
        super();
        if (INTERNALS.has(new.target)) {
            const internals = internalsOf(new.target, 'Element', 'localName');
            INTERNALS.set(this, {
                attributes: {},
                localName: internals.localName,
                ownerDocument: this.ownerDocument,
                shadowInit: null,
                shadowRoot: null,
            });
        }
    }
    hasAttribute(name) {
        return false;
    }
    getAttribute(name) {
        return null;
    }
    setAttribute(name, value) {
    }
    removeAttribute(name) {
    }
    attachShadow(init) {
        if (arguments.length < 1)
            throw new TypeError(`Failed to execute 'attachShadow' on 'Element': 1 argument required, but only 0 present.`);
        if (init !== Object(init))
            throw new TypeError(`Failed to execute 'attachShadow' on 'Element': The provided value is not of type 'ShadowRootInit'.`);
        if (init.mode !== 'open' && init.mode !== 'closed')
            throw new TypeError(`Failed to execute 'attachShadow' on 'Element': Failed to read the 'mode' property from 'ShadowRootInit': The provided value '${init.mode}' is not a valid enum value of type ShadowRootMode.`);
        const internals = internalsOf(this, 'Element', 'attachShadow');
        if (internals.shadowRoot)
            throw new Error('The operation is not supported.');
        internals.shadowInit = internals.shadowInit || {
            mode: init.mode,
            delegatesFocus: Boolean(init.delegatesFocus),
        };
        internals.shadowRoot =
            internals.shadowRoot ||
                (/^open$/.test(internals.shadowInit.mode)
                    ? Object.setPrototypeOf(new EventTarget(), ShadowRoot.prototype)
                    : null);
        return internals.shadowRoot;
    }
    get assignedSlot() {
        return null;
    }
    get innerHTML() {
        internalsOf(this, 'Element', 'innerHTML');
        return '';
    }
    set innerHTML(value) {
        internalsOf(this, 'Element', 'innerHTML');
    }
    get shadowRoot() {
        const internals = internalsOf(this, 'Element', 'shadowRoot');
        return Object(internals.shadowInit).mode === 'open'
            ? internals.shadowRoot
            : null;
    }
    get localName() {
        return internalsOf(this, 'Element', 'localName')
            .localName;
    }
    get nodeName() {
        return internalsOf(this, 'Element', 'nodeName')
            .localName.toUpperCase();
    }
    get tagName() {
        return internalsOf(this, 'Element', 'tagName')
            .localName.toUpperCase();
    }
}
class HTMLElement extends Element {
}
class HTMLBodyElement extends HTMLElement {
}
class HTMLDivElement extends HTMLElement {
}
class HTMLHeadElement extends HTMLElement {
}
class HTMLHtmlElement extends HTMLElement {
}
class HTMLSpanElement extends HTMLElement {
}
class HTMLStyleElement extends HTMLElement {
}
class HTMLTemplateElement extends HTMLElement {
}
class HTMLUnknownElement extends HTMLElement {
}
allowStringTag(Element);
allowStringTag(HTMLElement);
allowStringTag(HTMLBodyElement);
allowStringTag(HTMLDivElement);
allowStringTag(HTMLHeadElement);
allowStringTag(HTMLHtmlElement);
allowStringTag(HTMLSpanElement);
allowStringTag(HTMLStyleElement);
allowStringTag(HTMLTemplateElement);
allowStringTag(HTMLUnknownElement);

class Document extends Node {
    createElement(name) {
        const internals = internalsOf(this, 'Document', 'createElement');
        const customElementInternals = INTERNALS.get(internals.target.customElements);
        name = String(name).toLowerCase();
        const TypeOfHTMLElement = internals.constructorByName.get(name) ||
            (customElementInternals &&
                customElementInternals.constructorByName.get(name)) ||
            HTMLUnknownElement;
        const element = Object.setPrototypeOf(new EventTarget(), TypeOfHTMLElement.prototype);
        INTERNALS.set(element, {
            attributes: {},
            localName: name,
            ownerDocument: this,
            shadowInit: null,
            shadowRoot: null,
        });
        return element;
    }
    createNodeIterator(root, whatToShow = NodeFilter.SHOW_ALL, filter) {
        const target = Object.create(NodeIterator.prototype);
        INTERNALS.set(target, {
            filter,
            pointerBeforeReferenceNode: false,
            referenceNode: root,
            root,
            whatToShow,
        });
        return target;
    }
    createTextNode(data) {
        return new Text(data);
    }
    createTreeWalker(root, whatToShow = NodeFilter.SHOW_ALL, filter, expandEntityReferences) {
        const target = Object.create(TreeWalker.prototype);
        INTERNALS.set(target, {
            filter,
            currentNode: root,
            root,
            whatToShow,
        });
        return target;
    }
    get adoptedStyleSheets() {
        return [];
    }
    get styleSheets() {
        return [];
    }
}
class HTMLDocument extends Document {
}
allowStringTag(Document);
allowStringTag(HTMLDocument);
const initDocument = (target, exclude) => {
    if (exclude.has('document'))
        return;
    const EventTarget = target.EventTarget || globalThis.EventTarget;
    const HTMLDocument = target.HTMLDocument || globalThis.HTMLDocument;
    const document = (target.document = Object.setPrototypeOf(new EventTarget(), HTMLDocument.prototype));
    INTERNALS.set(document, {
        target,
        constructorByName: new Map([
            ['body', target.HTMLBodyElement],
            ['canvas', target.HTMLCanvasElement],
            ['div', target.HTMLDivElement],
            ['head', target.HTMLHeadElement],
            ['html', target.HTMLHtmlElement],
            ['img', target.HTMLImageElement],
            ['span', target.HTMLSpanElement],
            ['style', target.HTMLStyleElement],
        ]),
        nameByConstructor: new Map(),
    });
    const initElement = (name, Class) => {
        const target = Object.setPrototypeOf(new EventTarget(), Class.prototype);
        INTERNALS.set(target, {
            attributes: {},
            localName: name,
            ownerDocument: document,
            shadowRoot: null,
            shadowInit: null,
        });
        return target;
    };
    document.body = initElement('body', target.HTMLBodyElement);
    document.head = initElement('head', target.HTMLHeadElement);
    document.documentElement = initElement('html', target.HTMLHtmlElement);
};

class HTMLCanvasElement extends HTMLElement {
    get height() {
        return internalsOf(this, 'HTMLCanvasElement', 'height').height;
    }
    set height(value) {
        internalsOf(this, 'HTMLCanvasElement', 'height').height =
            Number(value) || 0;
    }
    get width() {
        return internalsOf(this, 'HTMLCanvasElement', 'width').width;
    }
    set width(value) {
        internalsOf(this, 'HTMLCanvasElement', 'width').width = Number(value) || 0;
    }
    captureStream() {
        return null;
    }
    getContext(contextType) {
        const internals = internalsOf(this, 'HTMLCanvasElement', 'getContext');
        switch (contextType) {
            case '2d':
                if (internals.renderingContext2D)
                    return internals.renderingContext2D;
                internals.renderingContext2D = __createCanvasRenderingContext2D(this);
                return internals.renderingContext2D;
            default:
                return null;
        }
    }
    toBlob() { }
    toDataURL() { }
    transferControlToOffscreen() { }
}
allowStringTag(HTMLCanvasElement);

class HTMLImageElement extends HTMLElement {
    get src() {
        return internalsOf(this, 'HTMLImageElement', 'src').src;
    }
    set src(value) {
        const internals = internalsOf(this, 'HTMLImageElement', 'src');
        internals.src = String(value);
    }
}
allowStringTag(HTMLImageElement);

function Image() {
    // @ts-expect-error
    INTERNALS.set(this, {
        attributes: {},
        localName: 'img',
        innerHTML: '',
        shadowRoot: null,
        shadowInit: null,
    });
}
Image.prototype = HTMLImageElement.prototype;

class MediaQueryList extends EventTarget {
    get matches() {
        return internalsOf(this, 'MediaQueryList', 'matches').matches;
    }
    get media() {
        return internalsOf(this, 'MediaQueryList', 'media').media;
    }
}
allowStringTag(MediaQueryList);
const initMediaQueryList = (target, exclude) => {
    if (exclude.has('MediaQueryList') || exclude.has('matchMedia'))
        return;
    const EventTarget = target.EventTarget || globalThis.EventTarget;
    const MediaQueryList = target.MediaQueryList || globalThis.MediaQueryList;
    target.matchMedia = function matchMedia(media) {
        const mql = Object.setPrototypeOf(new EventTarget(), MediaQueryList.prototype);
        INTERNALS.set(mql, {
            matches: false,
            media,
        });
        return mql;
    };
};

class IntersectionObserver {
    disconnect() { }
    observe() { }
    takeRecords() {
        return [];
    }
    unobserve() { }
}
class MutationObserver {
    disconnect() { }
    observe() { }
    takeRecords() {
        return [];
    }
    unobserve() { }
}
class ResizeObserver {
    disconnect() { }
    observe() { }
    takeRecords() {
        return [];
    }
    unobserve() { }
}
allowStringTag(MutationObserver);
allowStringTag(IntersectionObserver);
allowStringTag(ResizeObserver);

class OffscreenCanvas extends EventTarget {
    constructor(width, height) {
        super();
        if (arguments.length < 2)
            throw new TypeError(`Failed to construct 'OffscreenCanvas': 2 arguments required.`);
        width = Number(width) || 0;
        height = Number(height) || 0;
        INTERNALS.set(this, { width, height });
    }
    get height() {
        return internalsOf(this, 'OffscreenCanvas', 'height').height;
    }
    set height(value) {
        internalsOf(this, 'OffscreenCanvas', 'height').height = Number(value) || 0;
    }
    get width() {
        return internalsOf(this, 'OffscreenCanvas', 'width').width;
    }
    set width(value) {
        internalsOf(this, 'OffscreenCanvas', 'width').width = Number(value) || 0;
    }
    getContext(contextType) {
        const internals = internalsOf(this, 'HTMLCanvasElement', 'getContext');
        switch (contextType) {
            case '2d':
                if (internals.renderingContext2D)
                    return internals.renderingContext2D;
                internals.renderingContext2D = __createCanvasRenderingContext2D(this);
                return internals.renderingContext2D;
            default:
                return null;
        }
    }
    convertToBlob(options) {
        options = Object(options);
        Number(options.quality) || 0;
        const type = getImageType(String(options.type).trim().toLowerCase());
        return Promise.resolve(new Blob([], { type }));
    }
}
allowStringTag(OffscreenCanvas);
const getImageType = (type) => type === 'image/avif' ||
    type === 'image/jpeg' ||
    type === 'image/png' ||
    type === 'image/webp'
    ? type
    : 'image/png';

class Storage {
    clear() {
        internalsOf(this, 'Storage', 'clear').storage.clear();
    }
    getItem(key) {
        return getStringOrNull(internalsOf(this, 'Storage', 'getItem').storage.get(String(key)));
    }
    key(index) {
        return getStringOrNull([
            ...internalsOf(this, 'Storage', 'key').storage.keys(),
        ][Number(index) || 0]);
    }
    removeItem(key) {
        internalsOf(this, 'Storage', 'getItem').storage.delete(String(key));
    }
    setItem(key, value) {
        internalsOf(this, 'Storage', 'getItem').storage.set(String(key), String(value));
    }
    get length() {
        return internalsOf(this, 'Storage', 'size').storage.size;
    }
}
const getStringOrNull = (value) => typeof value === 'string' ? value : null;
const initStorage = (target, exclude) => {
    if (exclude.has('Storage') || exclude.has('localStorage'))
        return;
    target.localStorage = Object.create(Storage.prototype);
    const storageInternals = new Map();
    INTERNALS.set(target.localStorage, {
        storage: storageInternals,
    });
};

class StyleSheet {
}
class CSSStyleSheet extends StyleSheet {
    async replace(text) {
        return new CSSStyleSheet();
    }
    replaceSync(text) {
        return new CSSStyleSheet();
    }
    get cssRules() {
        return [];
    }
}
allowStringTag(StyleSheet);
allowStringTag(CSSStyleSheet);

class Window extends EventTarget {
    get self() {
        return this;
    }
    get top() {
        return this;
    }
    get window() {
        return this;
    }
    get innerHeight() {
        return 0;
    }
    get innerWidth() {
        return 0;
    }
    get scrollX() {
        return 0;
    }
    get scrollY() {
        return 0;
    }
}
allowStringTag(Window);
const initWindow = (target, exclude) => {
    if (exclude.has('Window') || exclude.has('window'))
        return;
    target.window = target;
};

function alert(...messages) {
    console.log(...messages);
}

const exclusionsForHTMLElement = [
    'CustomElementsRegistry',
    'HTMLElement',
    'HTMLBodyElement',
    'HTMLCanvasElement',
    'HTMLDivElement',
    'HTMLHeadElement',
    'HTMLHtmlElement',
    'HTMLImageElement',
    'HTMLStyleElement',
    'HTMLTemplateElement',
    'HTMLUnknownElement',
    'Image',
];
const exclusionsForElement = ['Element', ...exclusionsForHTMLElement];
const exclusionsForDocument = [
    'CustomElementsRegistry',
    'Document',
    'HTMLDocument',
    'document',
    'customElements',
];
const exclusionsForNode = [
    'Node',
    'DocumentFragment',
    'ShadowRoot',
    ...exclusionsForDocument,
    ...exclusionsForElement,
];
const exclusionsForEventTarget = [
    'Event',
    'CustomEvent',
    'EventTarget',
    'OffscreenCanvas',
    'MediaQueryList',
    'Window',
    ...exclusionsForNode,
];
const exclusionsForEvent = [
    'Event',
    'CustomEvent',
    'EventTarget',
    'MediaQueryList',
    'OffscreenCanvas',
    'Window',
    ...exclusionsForNode,
];
const exclusions = {
    'Document+': exclusionsForDocument,
    'Element+': exclusionsForElement,
    'Event+': exclusionsForEvent,
    'EventTarget+': exclusionsForEventTarget,
    'HTMLElement+': exclusionsForHTMLElement,
    'Node+': exclusionsForNode,
    'StyleSheet+': ['StyleSheet', 'CSSStyleSheet'],
};

const inheritance = {
    CSSStyleSheet: 'StyleSheet',
    CustomEvent: 'Event',
    DOMException: 'Error',
    Document: 'Node',
    DocumentFragment: 'Node',
    Element: 'Node',
    HTMLDocument: 'Document',
    HTMLElement: 'Element',
    HTMLBodyElement: 'HTMLElement',
    HTMLCanvasElement: 'HTMLElement',
    HTMLDivElement: 'HTMLElement',
    HTMLHeadElement: 'HTMLElement',
    HTMLHtmlElement: 'HTMLElement',
    HTMLImageElement: 'HTMLElement',
    HTMLSpanElement: 'HTMLElement',
    HTMLStyleElement: 'HTMLElement',
    HTMLTemplateElement: 'HTMLElement',
    HTMLUnknownElement: 'HTMLElement',
    Image: 'HTMLElement',
    MediaQueryList: 'EventTarget',
    Node: 'EventTarget',
    OffscreenCanvas: 'EventTarget',
    ShadowRoot: 'DocumentFragment',
    Window: 'EventTarget',
};

const polyfill = (target, options) => {
    const webAPIs = {
        ByteLengthQueuingStrategy,
        CanvasRenderingContext2D,
        CharacterData,
        Comment,
        CountQueuingStrategy,
        CSSStyleSheet,
        CustomElementRegistry,
        CustomEvent,
        Document,
        DocumentFragment,
        DOMException,
        Element,
        Event,
        EventTarget,
        File,
        FormData,
        HTMLDocument,
        HTMLElement,
        HTMLBodyElement,
        HTMLCanvasElement,
        HTMLDivElement,
        HTMLHeadElement,
        HTMLHtmlElement,
        HTMLImageElement,
        HTMLSpanElement,
        HTMLStyleElement,
        HTMLTemplateElement,
        HTMLUnknownElement,
        Headers: Headers$1,
        IntersectionObserver,
        Image,
        ImageData,
        MediaQueryList,
        MutationObserver,
        Node,
        NodeFilter: NodeFilter$1,
        NodeIterator: NodeIterator$1,
        OffscreenCanvas,
        ReadableByteStreamController,
        ReadableStream,
        ReadableStreamBYOBReader,
        ReadableStreamBYOBRequest,
        ReadableStreamDefaultController,
        ReadableStreamDefaultReader,
        Request: Request$1,
        ResizeObserver,
        Response: Response$1,
        ShadowRoot,
        Storage,
        StyleSheet,
        Text,
        TransformStream,
        TreeWalker,
        URLPattern: U,
        WritableStream,
        WritableStreamDefaultController,
        WritableStreamDefaultWriter,
        Window,
        alert,
        cancelAnimationFrame,
        cancelIdleCallback,
        clearTimeout,
        crypto: webcrypto,
        fetch: fetch$1,
        requestAnimationFrame,
        requestIdleCallback,
        setTimeout,
        structuredClone,
    };
    // initialize exclude options
    const excludeOptions = new Set(typeof Object(options).exclude === 'string'
        ? String(Object(options).exclude).trim().split(/\s+/)
        : Array.isArray(Object(options).exclude)
            ? Object(options).exclude.reduce((array, entry) => array.splice(array.length, 0, ...(typeof entry === 'string' ? entry.trim().split(/\s+/) : [])) && array, [])
            : []);
    // expand exclude options using exclusion shorthands
    for (const excludeOption of excludeOptions) {
        if (excludeOption in exclusions) {
            for (const exclusion of exclusions[excludeOption]) {
                excludeOptions.add(exclusion);
            }
        }
    }
    // apply each WebAPI
    for (const name of Object.keys(webAPIs)) {
        // skip WebAPIs that are excluded
        if (excludeOptions.has(name))
            continue;
        // skip WebAPIs that are built-in
        if (Object.hasOwnProperty.call(target, name))
            continue;
        // define WebAPIs on the target
        Object.defineProperty(target, name, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: webAPIs[name],
        });
    }
    // ensure WebAPIs correctly inherit other WebAPIs
    for (const name of Object.keys(webAPIs)) {
        // skip WebAPIs that are excluded
        if (excludeOptions.has(name))
            continue;
        // skip WebAPIs that do not extend other WebAPIs
        if (!Object.hasOwnProperty.call(inheritance, name))
            continue;
        const Class = target[name];
        const Super = target[inheritance[name]];
        // skip WebAPIs that are not available
        if (!Class || !Super)
            continue;
        // skip WebAPIs that are already inherited correctly
        if (Object.getPrototypeOf(Class.prototype) === Super.prototype)
            continue;
        // define WebAPIs inheritance
        Object.setPrototypeOf(Class.prototype, Super.prototype);
    }
    if (!excludeOptions.has('HTMLDocument') &&
        !excludeOptions.has('HTMLElement')) {
        initDocument(target, excludeOptions);
        if (!excludeOptions.has('CustomElementRegistry')) {
            initCustomElementRegistry(target, excludeOptions);
        }
    }
    initMediaQueryList(target, excludeOptions);
    initStorage(target, excludeOptions);
    initWindow(target, excludeOptions);
    return target;
};
polyfill.internals = (target, name) => {
    const init = {
        CustomElementRegistry: initCustomElementRegistry,
        Document: initDocument,
        MediaQueryList: initMediaQueryList,
        Storage: initStorage,
        Window: initWindow,
    };
    init[name](target, new Set());
    return target;
};

const commonBinaryMimeTypes = new Set([
    "application/octet-stream",
    // Docs
    "application/epub+zip",
    "application/msword",
    "application/pdf",
    "application/rtf",
    "application/vnd.amazon.ebook",
    "application/vnd.ms-excel",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    // Fonts
    "font/otf",
    "font/woff",
    "font/woff2",
    // Images
    "image/bmp",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/tiff",
    "image/vnd.microsoft.icon",
    "image/webp",
    // Audio
    "audio/3gpp",
    "audio/aac",
    "audio/basic",
    "audio/mpeg",
    "audio/ogg",
    "audio/wavaudio/webm",
    "audio/x-aiff",
    "audio/x-midi",
    "audio/x-wav",
    // Video
    "video/3gpp",
    "video/mp2t",
    "video/mpeg",
    "video/ogg",
    "video/quicktime",
    "video/webm",
    "video/x-msvideo",
    // Archives
    "application/java-archive",
    "application/vnd.apple.installer+xml",
    "application/x-7z-compressed",
    "application/x-apple-diskimage",
    "application/x-bzip",
    "application/x-bzip2",
    "application/x-gzip",
    "application/x-java-archive",
    "application/x-rar-compressed",
    "application/x-tar",
    "application/x-zip",
    "application/zip",
]);
function isBinaryContentType(contentType) {
    if (!contentType)
        return false;
    const value = contentType?.split(";")[0] ?? "";
    return commonBinaryMimeTypes.has(value);
}

function isApigV2Event(event) {
    return event.version === "2.0";
}
function isApigV1Event(event) {
    return event.version === undefined && !isCfEvent(event);
}
function isCfEvent(event) {
    return event.Records !== undefined;
}
function convertFrom(event) {
    let iEvent;
    if (isCfEvent(event)) {
        iEvent = convertFromCfEvent(event);
    }
    else if (isApigV2Event(event)) {
        iEvent = convertFromApigV2Event(event);
    }
    else if (isApigV1Event(event)) {
        iEvent = convertFromApigV1Event(event);
    }
    else {
        throw new Error("Unsupported event type");
    }
    // Fix host header
    if (iEvent.headers["x-forwarded-host"]) {
        iEvent.headers.host = iEvent.headers["x-forwarded-host"];
    }
    // Build URL
    const scheme = iEvent.headers["x-forwarded-protocol"] || "https";
    const url = new URL(iEvent.queryString
        ? `${iEvent.rawPath}?${iEvent.queryString}`
        : iEvent.rawPath, `${scheme}://${iEvent.headers.host}`).toString();
    return { ...iEvent, url };
}
function convertFromApigV1Event(event) {
    const { path, body, httpMethod, requestContext, isBase64Encoded } = event;
    const headers = normalizeApigV1Headers(event);
    return {
        type: "v1",
        method: httpMethod,
        rawPath: path,
        queryString: normalizeApigV1QueryParams(event),
        body: Buffer.from(body ?? "", isBase64Encoded ? "base64" : "utf8"),
        headers,
        remoteAddress: requestContext.identity.sourceIp,
    };
}
function convertFromApigV2Event(event) {
    const { rawPath, rawQueryString, requestContext } = event;
    return {
        type: "v2",
        method: requestContext.http.method,
        rawPath,
        queryString: rawQueryString,
        body: normalizeApigV2Body(event),
        headers: normalizeApigV2Headers(event),
        remoteAddress: requestContext.http.sourceIp,
    };
}
function convertFromCfEvent(event) {
    const { method, uri, querystring, body, clientIp } = event.Records[0].cf.request;
    return {
        type: "cf",
        method,
        rawPath: uri,
        queryString: querystring,
        body: Buffer.from(body?.data ?? "", body?.encoding === "base64" ? "base64" : "utf8"),
        headers: normalizeCfHeaders(event),
        remoteAddress: clientIp,
    };
}
async function convertTo({ type, response, responseStream, cookies: appCookies, }) {
    // Parse headers (except cookies)
    const headers = Array.from(response.headers.entries())
        .filter(([key]) => key !== "set-cookie")
        .reduce((headers, [key, value]) => {
        headers[key] = value;
        return headers;
    }, {});
    // Parse cookies
    const cookies = parse$1([
        ...splitCookiesString(response.headers.getSetCookie() ?? undefined),
        ...(appCookies ?? []),
    ], { decodeValues: false, map: false, silent: true });
    // Parse isBase64Encoded
    const isBase64Encoded = isBinaryContentType(headers["content-type"]);
    // Build streaming result
    if (type === "v2" && responseStream) {
        return convertToApigV2StreamingResult({
            statusCode: response.status,
            headers,
            body: response.body,
            cookies,
            responseStream,
            isBase64Encoded,
        });
    }
    // Build non-streaming result
    const result = {
        type,
        statusCode: response.status,
        headers,
        cookies,
        isBase64Encoded,
        body: isBase64Encoded
            ? Buffer.from(await response.arrayBuffer()).toString("base64")
            : await response.text(),
    };
    if (type === "v2") {
        return convertToApigV2Result(result);
    }
    else if (type === "v1") {
        return convertToApigV1Result(result);
    }
    else if (type === "cf") {
        return convertToCfResult(result);
    }
    throw new Error("Unsupported event type");
}
function convertToApigV1Result({ headers, statusCode, body, isBase64Encoded, cookies, }) {
    const multiValueHeaders = {};
    if (cookies.length > 0) {
        multiValueHeaders["set-cookie"] = stringifyCookies(cookies);
    }
    const response = {
        statusCode,
        headers,
        multiValueHeaders,
        body,
        isBase64Encoded,
    };
    return response;
}
function convertToApigV2Result({ headers, statusCode, body, isBase64Encoded, cookies, }) {
    const response = {
        statusCode,
        headers,
        cookies: cookies.length > 0 ? stringifyCookies(cookies) : undefined,
        body,
        isBase64Encoded,
    };
    return response;
}
function convertToApigV2StreamingResult({ statusCode, headers, cookies, body, responseStream, isBase64Encoded, }) {
    if (!isBase64Encoded) {
        headers["content-encoding"] = "gzip";
    }
    const metadata = {
        statusCode,
        headers,
    };
    if (cookies.length > 0) {
        metadata.headers["set-cookie"] = stringifyCookies(cookies).join(", ");
    }
    responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);
    if (!body) {
        responseStream.write(0);
        responseStream.end();
        return;
    }
    if (body.locked) {
        responseStream.write("Fatal error: Response body is locked. " +
            `This can happen when the response was already read (for example through 'response.json()' or 'response.text()').`);
        responseStream.end();
        return;
    }
    const reader = body.getReader();
    if (responseStream.destroyed) {
        reader.cancel();
        return;
    }
    let streamToWrite;
    if (!isBase64Encoded) {
        const gzip = zlib.createGzip();
        gzip.pipe(responseStream);
        streamToWrite = gzip;
    }
    else {
        streamToWrite = responseStream;
    }
    const cancel = (error) => {
        streamToWrite.off("close", cancel);
        streamToWrite.off("error", cancel);
        // If the reader has already been interrupted with an error earlier,
        // then it will appear here, it is useless, but it needs to be catch.
        reader.cancel(error).catch(() => { });
        if (!isBase64Encoded) {
            // Unpipe the gzip stream to ensure no more data is written
            streamToWrite.unpipe(responseStream);
            if (error) {
                streamToWrite.destroy(error);
            }
            else {
                // In case there's no error, just close the gzip stream
                streamToWrite.end();
            }
        }
        else if (error) {
            responseStream.destroy(error);
        }
    };
    streamToWrite.on("close", cancel);
    streamToWrite.on("error", cancel);
    next();
    async function next() {
        try {
            for (;;) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                if (!isBase64Encoded) {
                    const writer = streamToWrite;
                    const result = writer.write(value, () => {
                        writer.flush(zlib.constants.Z_SYNC_FLUSH);
                    });
                    if (!result)
                        writer.once("drain", next);
                }
                else {
                    if (!streamToWrite.write(value)) {
                        streamToWrite.once("drain", next);
                        return;
                    }
                }
            }
            streamToWrite.end();
        }
        catch (error) {
            cancel(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
function convertToCfResult({ statusCode, headers, cookies, body, isBase64Encoded, }) {
    const combinedHeaders = Object.entries(headers).reduce((headers, [key, value]) => {
        headers[key.toLowerCase()] = [{ key, value }];
        return headers;
    }, {});
    combinedHeaders["set-cookie"] = stringifyCookies(cookies).map((cookie) => ({
        key: "set-cookie",
        value: cookie,
    }));
    const response = {
        status: statusCode.toString(),
        statusDescription: "OK",
        headers: Object.entries(headers).reduce((headers, [key, value]) => {
            headers[key.toLowerCase()] = [{ key, value }];
            return headers;
        }, {}),
        bodyEncoding: isBase64Encoded ? "base64" : "text",
        body: body,
    };
    return response;
}
function normalizeApigV2Headers({ headers, cookies }) {
    const combinedHeaders = {};
    if (Array.isArray(cookies)) {
        combinedHeaders["cookie"] = cookies.join("; ");
    }
    for (const [key, value] of Object.entries(headers ?? {})) {
        combinedHeaders[key.toLowerCase()] = value;
    }
    return combinedHeaders;
}
function normalizeApigV2Body({ body, isBase64Encoded, }) {
    if (Buffer.isBuffer(body)) {
        return body;
    }
    else if (typeof body === "string") {
        return Buffer.from(body, isBase64Encoded ? "base64" : "utf8");
    }
    else if (typeof body === "object") {
        return Buffer.from(JSON.stringify(body));
    }
    return Buffer.from("", "utf8");
}
function normalizeApigV1QueryParams({ multiValueQueryStringParameters, queryStringParameters, }) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(multiValueQueryStringParameters ?? {})) {
        if (value !== undefined) {
            for (const v of value) {
                params.append(key, v);
            }
        }
    }
    for (const [key, value] of Object.entries(queryStringParameters ?? {})) {
        if (value !== undefined) {
            params.append(key, value);
        }
    }
    const value = params.toString();
    return value ?? "";
}
function normalizeApigV1Headers({ multiValueHeaders, headers, }) {
    const combinedHeaders = {};
    for (const [key, values] of Object.entries(multiValueHeaders ?? {})) {
        if (values) {
            combinedHeaders[key.toLowerCase()] = values.join(",");
        }
    }
    for (const [key, value] of Object.entries(headers ?? {})) {
        if (value) {
            combinedHeaders[key.toLowerCase()] = value;
        }
    }
    return combinedHeaders;
}
function normalizeCfHeaders(event) {
    const combinedHeaders = {};
    for (const [key, values] of Object.entries(event.Records[0].cf.request.headers)) {
        for (const { value } of values) {
            if (value) {
                combinedHeaders[key.toLowerCase()] = value;
            }
        }
    }
    return combinedHeaders;
}
function stringifyCookies(cookies) {
    return cookies.map((cookie) => `${cookie.name}=${cookie.value};${Object.entries(cookie)
        .filter(([key, value]) => key !== "value" &&
        key !== "name" &&
        typeof value !== "undefined" &&
        value !== false)
        .map(([key, value]) => typeof value === "boolean"
        ? `${key};`
        : typeof value.toUTCString !== "undefined"
            ? `${key}=${value.toUTCString()};`
            : `${key}=${value};`)
        .join("")}`);
}

function debug(...args) {
    if (process.env.SST_DEBUG) {
        console.log(...args.map((arg) => JSON.stringify(arg, null, 2)));
    }
}

const astroMajorVersion = parseInt(version.split(".")[0] ?? 0);
polyfill(globalThis, {
    exclude: "window document",
});
function createRequest(internalEvent) {
    const requestUrl = internalEvent.url;
    const requestProps = {
        method: internalEvent.method,
        headers: internalEvent.headers,
        body: ["GET", "HEAD"].includes(internalEvent.method)
            ? undefined
            : internalEvent.body,
    };
    return new Request(requestUrl, requestProps);
}
function createExports(manifest, { responseMode }) {
    debug("handlerInit", responseMode);
    debug("astroVersion", version);
    const isStreaming = responseMode === "stream";
    const app = new NodeApp(manifest);
    async function streamHandler(event, responseStream) {
        debug("event", event);
        // Parse Lambda event
        const internalEvent = convertFrom(event);
        // Build request
        const request = createRequest(internalEvent);
        // Handle page not found
        const routeData = app.match(request);
        if (!routeData) {
            return streamError(404, "Not found", responseStream);
        }
        let response;
        if (astroMajorVersion <= 3) {
            // Astro 3.x and below use RouteData only
            debug("routeData", routeData);
            // Process request
            response = await app.render(request, routeData);
        }
        else {
            // Astro 4.x and above use RenderOptions
            const renderOptions = {
                routeData,
                clientAddress: internalEvent.headers["x-forwarded-for"] ||
                    internalEvent.remoteAddress,
            };
            debug("renderOptions", renderOptions);
            // Process request
            response = await app.render(request, renderOptions);
        }
        // Stream response back to Cloudfront
        const convertedResponse = await convertTo({
            type: internalEvent.type,
            response,
            responseStream,
            cookies: Array.from(app.setCookieHeaders(response)),
        });
        debug("response", convertedResponse);
    }
    async function bufferHandler(event) {
        debug("event", event);
        // Parse Lambda event
        const internalEvent = convertFrom(event);
        // Build request
        const request = createRequest(internalEvent);
        // Handle page not found
        const routeData = app.match(request);
        if (!routeData) {
            console.error("Not found");
            return convertTo({
                type: internalEvent.type,
                response: new Response("Not found", { status: 404 }),
            });
        }
        const renderOptions = {
            routeData,
            clientAddress: internalEvent.headers["x-forwarded-for"] || internalEvent.remoteAddress,
        };
        debug("renderOptions", renderOptions);
        // Process request
        const response = await app.render(request, renderOptions);
        // Buffer response back to Cloudfront
        const convertedResponse = await convertTo({
            type: internalEvent.type,
            response,
            cookies: Array.from(app.setCookieHeaders(response)),
        });
        debug("response", convertedResponse);
        return convertedResponse;
    }
    return {
        // https://docs.aws.amazon.com/lambda/latest/dg/configuration-response-streaming.html
        handler: isStreaming
            ? awslambda.streamifyResponse(streamHandler)
            : bufferHandler,
    };
}
function streamError(statusCode, error, responseStream) {
    console.error(error);
    responseStream = awslambda.HttpResponseStream.from(responseStream, {
        statusCode,
    });
    responseStream.write(error.toString());
    responseStream.end();
}

const serverEntrypointModule = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  createExports,
  streamError
}, Symbol.toStringTag, { value: 'Module' }));

const _page0 = () => import('./chunks/generic_BDojKSus.mjs');
const _page1 = () => import('./chunks/about_TCVon6Z8.mjs');
const _page2 = () => import('./chunks/index_B-qrfA6A.mjs');
const _page3 = () => import('./chunks/_.._BlEhPgC0.mjs');
const _page4 = () => import('./chunks/contact_Da4PSpem.mjs');
const _page5 = () => import('./chunks/portfolio_DdcytXrT.mjs');
const _page6 = () => import('./chunks/rss_Br6DAif_.mjs');
const _page7 = () => import('./chunks/index_BITzKUON.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/blog/index.astro", _page2],
    ["src/pages/blog/[...slug].astro", _page3],
    ["src/pages/contact.astro", _page4],
    ["src/pages/portfolio.astro", _page5],
    ["src/pages/rss.xml.js", _page6],
    ["src/pages/index.astro", _page7]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    renderers,
    middleware: onRequest
});
const _args = {
    "responseMode": "buffer"
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, pageMap };
//# sourceMappingURL=entry.mjs.map
