import { Hono } from "hono";
import { XMLParser } from "fast-xml-parser";
import type { FC, PropsWithChildren } from "hono/jsx";

// ==================== 类型导出 ====================
export interface ApiConfig {
  name: string;
  url: string;
}

export interface Category {
  分类号: string;
  分类名: string;
}

export interface Video {
  id?: string | number;
  name?: string;
  pic?: string;
  year?: string;
  last?: string;
  director?: string;
  actor?: string;
  type?: string;
  area?: string;
  des?: string;
  tid?: string;
  dl?: { dd?: DdItem | DdItem[] };
}

export type DdItem = string | { "@flag"?: string; "#text"?: string };

export interface Pagination {
  current: number;
  prev: number;
  next: number;
  last: number;
  firstUrl: string;
  prevUrl: string;
  nextUrl: string;
  lastUrl: string;
}

export interface PageContext {
  siteName: string;
  siteEmail: string;
  currentApiName: string;
  currentApiUrl: string;
  currentApi: string;
  apiList: ApiConfig[];
  categories: Category[];
  videoData: Video[];
  videoInfo?: Video;
  pagination: Pagination;
  currentCategory: string;
  searchKeyword: string;
  videoName: string;
  videoParser: string;
  baseUrl: string;
  templatePath: string;
  pageType: "list" | "search" | "info";
  totalRecords: number;
  sortId: string;
}

// ==================== 内置配置 ====================
const BUILTIN_CONFIG = {
  site: {
    name: "影视资源",
    domain: "demo.test",
    email: "admin@admin.com",
  },
  apis: [
    { name: "豪华资源", url: "https://hhzyapi.com/api.php/provide/vod/at/xml" },
    { name: "无尽资源", url: "https://api.wujinapi.me/api.php/provide/vod/from/wjm3u8/at/xml/" },
    { name: "红牛资源", url: "https://www.hongniuzy2.com/api.php/provide/vod/at/xml/" },
    { name: "如意资源", url: "https://cj.rycjapi.com/api.php/provide/vod/at/xml/" },
  ],
  videoParser: "https://vip.zykbf.com/?url=",
  templateName: "default",
  sortDesc: "no",
  showTimeLimit: "",
  seo: {
    title: {
      list: "{{CURRENT_CATEGORY}} - {{SITE_NAME}}",
      search: "{{SEARCH_KEYWORD}}的搜索结果 - {{SITE_NAME}}",
      info: "{{VIDEO_NAME}} - {{SITE_NAME}}",
    },
    keywords: {
      list: "{{CURRENT_CATEGORY}},最新电影,最新电视,最新综艺,最新动漫",
      search: "{{SEARCH_KEYWORD}},最新电影,最新电视,最新综艺,最新动漫",
      info: "{{VIDEO_NAME}},最新电影,最新电视,最新综艺,最新动漫",
    },
    description: {
      list: "{{SITE_NAME}}提供最新的电影、电视、综艺、动漫在线播放服务",
      search: "{{SITE_NAME}}提供{{SEARCH_KEYWORD}}的在线播放服务",
      info: "{{SITE_NAME}}提供{{VIDEO_NAME}}的在线播放服务",
    },
  },
};

interface SiteConfig {
  name: string;
  domain: string;
  email: string;
}

interface SeoTemplates {
  title: { list: string; search: string; info: string };
  keywords: { list: string; search: string; info: string };
  description: { list: string; search: string; info: string };
}

interface Config {
  site: SiteConfig;
  apis: ApiConfig[];
  videoParser: string;
  templateName: string;
  sortDesc: string;
  showTimeLimit: string;
  seo: SeoTemplates;
}

interface VideoData {
  rss?: {
    list?: {
      video?: Video | Video[];
      "@pagecount"?: string;
      "@recordcount"?: string;
    };
    class?: {
      ty?: TyItem | TyItem[];
    };
  };
}

interface TyItem {
  "@id"?: string;
  "#text"?: string;
}

// ==================== 模板组件接口 ====================
interface LayoutProps {
  ctx: PageContext;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
}

interface TemplateModule {
  Layout: FC<PropsWithChildren<LayoutProps>>;
  List: FC<{ ctx: PageContext }>;
  Info: FC<{ ctx: PageContext }>;
  Search: FC<{ ctx: PageContext }>;
}

// ==================== 配置加载 ====================
let configCache: Config | null = null;

async function loadConfig(): Promise<Config> {
  if (configCache) return configCache;
  try {
    const file = Bun.file("./config.json");
    const exists = await file.exists();
    if (exists) {
      configCache = (await file.json()) as Config;
      return configCache;
    }
  } catch {
    // fallback to builtin
  }
  configCache = BUILTIN_CONFIG as unknown as Config;
  return configCache;
}

// ==================== SEO 模板引擎 ====================
function applySeoTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || "");
}

// ==================== 辅助函数 ====================
function parseCookie(cookieHeader: string | undefined, name: string): string {
  if (!cookieHeader) return "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1]! : "";
}

function getProtocol(c: {
  req: { header: (n: string) => string | undefined };
}): string {
  return (
    c.req.header("x-forwarded-proto") ||
    c.req.header("x-url-scheme") ||
    "http"
  );
}

function ensureArray<T>(data: T | T[] | undefined): T[] {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}

// ==================== 随机国内 IP ====================
const IP_RANGES: [number, number][] = [
  [607649792, 608174079],
  [1038614528, 1039007743],
  [1783627776, 1784676351],
  [2035023872, 2035154943],
  [2078801920, 2079064063],
  [-1950089216, -1948778497],
  [-1425539072, -1425014785],
  [-1236271104, -1235419137],
  [-770113536, -768606209],
  [-569376768, -564133889],
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function long2ip(ipInt: number): string {
  return `${(ipInt >>> 24) & 255}.${(ipInt >>> 16) & 255}.${(ipInt >>> 8) & 255}.${ipInt & 255}`;
}

function randomChinaIp(): string {
  const [min, max] = IP_RANGES[randomInt(0, IP_RANGES.length - 1)]!;
  return long2ip(randomInt(min, max));
}

// ==================== API 数据获取 ====================
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchAPI(url: string): Promise<string | null> {
  const ip = randomChinaIp();
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "X-Forwarded-For": ip, "User-Agent": UA },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    console.error("API fetch error:", e);
    return null;
  }
}

// ==================== XML 解析器 ====================
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@",
  allowBooleanAttributes: true,
});

// ==================== 数据获取 ====================
async function fetchCategories(apiUrl: string): Promise<Category[]> {
  const raw = await fetchAPI(`${apiUrl}?ac=list`);
  if (!raw) return [{ 分类号: "", 分类名: "最近更新" }];

  const json = parser.parse(raw) as VideoData;
  const categories: Category[] = [{ 分类号: "", 分类名: "最近更新" }];

  if (json.rss?.class?.ty) {
    const tys = ensureArray(json.rss.class.ty);
    for (const ty of tys) {
      const id = typeof ty === "object" ? (ty["@id"] ?? "") : "";
      const name = typeof ty === "object" ? (ty["#text"] ?? "") : String(ty);
      categories.push({ 分类号: String(id), 分类名: String(name) });
    }
  }
  return categories;
}

async function fetchVideoData(
  sort: "info" | "search" | "list",
  id: string,
  page: number,
  apiUrl: string,
  showTimeLimit: string,
  sortDesc: string,
): Promise<VideoData> {
  let actualPage = page;
  let requestUrl = "";

  switch (sort) {
    case "info":
      requestUrl = `${apiUrl}?ac=videolist&ids=${id}${showTimeLimit}`;
      break;
    case "search":
      requestUrl = `${apiUrl}?ac=videolist&wd=${encodeURIComponent(id)}&pg=${page}${showTimeLimit}`;
      break;
    case "list": {
      if (sortDesc === "yes") {
        const probeContent = await fetchAPI(
          `${apiUrl}?ac=videolist&t=${id}&pg=1${showTimeLimit}`,
        );
        let pageCount = 1;
        if (probeContent) {
          const match = probeContent.match(/pagecount="(\d+)"/);
          if (match) pageCount = parseInt(match[1]!, 10);
        }
        actualPage = Math.max(1, pageCount - page + 1);
      }
      requestUrl = `${apiUrl}?ac=videolist&t=${id}&pg=${actualPage}${showTimeLimit}`;
      break;
    }
  }

  const raw = await fetchAPI(requestUrl);
  if (!raw) return {};

  const clean = raw.replace(
    /<script[^>]*>[\s\S]*?<\/script>|<span[^>]*?>|<\/span>|<p\s[^>]*?>|<p>|<\/p>/gi,
    "",
  );
  return parser.parse(clean) as VideoData;
}

// ==================== 分页 URL 构建 ====================
function buildPageUrl(
  baseUrl: string,
  pageType: "list" | "search" | "info",
  id: string,
  page: number,
  apiSelect: string,
): string {
  const params = new URLSearchParams();
  if (apiSelect && apiSelect !== "1") params.set("api", apiSelect);

  if (pageType === "list") {
    if (id) params.set("sort", id);
    params.set("page", String(page));
  } else if (pageType === "search") {
    params.set("key", id);
    params.set("page", String(page));
  } else if (pageType === "info") {
    params.set("info", id);
  }

  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

// ==================== 模板加载器（带缓存） ====================
const templateCache = new Map<string, TemplateModule>();

async function loadTemplate(templateName: string): Promise<TemplateModule> {
  const cached = templateCache.get(templateName);
  if (cached) return cached;

  const layoutMod = await import(`./views/${templateName}/Layout.tsx`);
  const listMod = await import(`./views/${templateName}/List.tsx`);
  const infoMod = await import(`./views/${templateName}/Info.tsx`);
  const searchMod = await import(`./views/${templateName}/Search.tsx`);

  const tpl: TemplateModule = {
    Layout: layoutMod.default,
    List: listMod.default,
    Info: infoMod.default,
    Search: searchMod.default,
  };

  templateCache.set(templateName, tpl);
  return tpl;
}

// ==================== Hono 应用 ====================
const app = new Hono();

app.get("/", async (c) => {
  const config = await loadConfig();

  // 解析请求参数
  const infoId = c.req.query("info") || null;
  const searchKey = c.req.query("key") || null;
  const sortId = c.req.query("sort") || "";
  const page = Math.max(1, parseInt(c.req.query("page") || "1", 10));
  const apiSelectQuery = c.req.query("api") || null;

  // 确定 API 源
  let apiSelect = parseCookie(c.req.header("cookie"), "api_select") || "1";
  if (apiSelectQuery) apiSelect = apiSelectQuery;
  let apiIdx = parseInt(apiSelect, 10) - 1;
  if (apiIdx < 0 || apiIdx >= config.apis.length) {
    apiIdx = 0;
    apiSelect = "1";
  }
  const currentApi = config.apis[apiIdx]!;

  // 确定页面类型（c.req.query 已自动解码，无需二次 decodeURIComponent）
  let pageType: "list" | "search" | "info" = "list";
  let uniqueId = sortId;
  if (infoId) {
    pageType = "info";
    uniqueId = infoId;
  } else if (searchKey) {
    pageType = "search";
    uniqueId = searchKey;
  }

  const baseUrl = `${getProtocol(c)}://${c.req.header("host")}`;

  // 获取分类和视频数据
  const categories = await fetchCategories(currentApi.url);
  const videoDataRaw = await fetchVideoData(
    pageType,
    uniqueId,
    page,
    currentApi.url,
    config.showTimeLimit,
    config.sortDesc,
  );

  // 解析视频列表 / 详情
  let videoInfo: Video | undefined;
  let videoList: Video[] = [];

  if (pageType === "info") {
    const v = videoDataRaw.rss?.list?.video;
    if (v) {
      videoInfo = Array.isArray(v) ? v[0] : v;
    }
  } else {
    const v = videoDataRaw.rss?.list?.video;
    if (v) {
      videoList = Array.isArray(v) ? v : [v];
    }
  }

  // 分页信息
  const pageCount = parseInt(
    videoDataRaw.rss?.list?.["@pagecount"] || "1",
    10,
  );
  const totalRecords = parseInt(
    videoDataRaw.rss?.list?.["@recordcount"] || String(videoList.length),
    10,
  );

  const pagination: Pagination = {
    current: page,
    prev: Math.max(1, page - 1),
    next: Math.min(pageCount, page + 1),
    last: pageCount,
    firstUrl: buildPageUrl(baseUrl, pageType, uniqueId, 1, apiSelect),
    prevUrl: buildPageUrl(
      baseUrl,
      pageType,
      uniqueId,
      Math.max(1, page - 1),
      apiSelect,
    ),
    nextUrl: buildPageUrl(
      baseUrl,
      pageType,
      uniqueId,
      Math.min(pageCount, page + 1),
      apiSelect,
    ),
    lastUrl: buildPageUrl(baseUrl, pageType, uniqueId, pageCount, apiSelect),
  };

  // 页面上下文关键字
  let currentCategory = "最近更新";
  let searchKeyword = "";
  let videoName = "";

  if (pageType === "search") {
    searchKeyword = uniqueId;
  } else if (pageType === "list") {
    const found = categories.find((cat) => cat.分类号 === uniqueId);
    if (found) currentCategory = found.分类名;
  } else if (pageType === "info" && videoInfo) {
    videoName = videoInfo.name || "";
  }

  // SEO 模板变量
  const seoVars: Record<string, string> = {
    SITE_NAME: config.site.name,
    CURRENT_CATEGORY: currentCategory,
    SEARCH_KEYWORD: searchKeyword,
    VIDEO_NAME: videoName,
  };

  const seoTitle = applySeoTemplate(config.seo.title[pageType], seoVars);
  const seoKeywords = applySeoTemplate(config.seo.keywords[pageType], seoVars);
  const seoDescription = applySeoTemplate(
    config.seo.description[pageType],
    seoVars,
  );

  // 构建页面上下文
  const ctx: PageContext = {
    siteName: config.site.name,
    siteEmail: config.site.email,
    currentApiName: currentApi.name,
    currentApiUrl: currentApi.url,
    currentApi: apiSelect,
    apiList: config.apis,
    categories,
    videoData: videoList,
    videoInfo,
    pagination,
    currentCategory,
    searchKeyword,
    videoName,
    videoParser: config.videoParser,
    baseUrl,
    templatePath: `${baseUrl}/${config.templateName}`,
    pageType,
    totalRecords,
    sortId,
  };

  // 设置 Cookie
  c.header(
    "Set-Cookie",
    `api_select=${apiSelect}; Path=/; Max-Age=${86400 * 30}`,
  );

  // 加载模板并渲染
  const tpl = await loadTemplate(config.templateName);

  let pageContent;
  if (pageType === "info") {
    pageContent = <tpl.Info ctx={ctx} />;
  } else if (pageType === "search") {
    pageContent = <tpl.Search ctx={ctx} />;
  } else {
    pageContent = <tpl.List ctx={ctx} />;
  }

  return c.html(
    <tpl.Layout ctx={ctx} seoTitle={seoTitle} seoKeywords={seoKeywords} seoDescription={seoDescription}>
      {pageContent}
    </tpl.Layout>,
  );
});

// ==================== 启动服务 ====================
const port = parseInt(process.env.DEPLOY_RUN_PORT || "5000", 10);

console.log(`[影视资源] Server starting on port ${port}`);

Bun.serve({
  port,
  fetch: app.fetch,
});
