import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

const escHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

async function injectSeo(html: string, reqPath: string): Promise<string> {
  try {
    const { db, dbEnabled } = await import("./db");
    if (!dbEnabled) return html;
    const { seoMeta, siteContent } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const rows = await db.select().from(seoMeta).where(eq(seoMeta.path, reqPath));
    const meta = rows[0];
    const globals = await db.select().from(siteContent);
    const g = (k: string) => globals.find((c) => c.key === k)?.valueAr || null;
    if (!meta) return html;
    const isAr = true; // site is Arabic-first
    const title = (isAr ? meta.titleAr : meta.titleEn) || meta.titleAr || meta.titleEn;
    const desc = (isAr ? meta.descAr : meta.descEn) || meta.descAr || meta.descEn;
    if (title) html = html.replace(/<title>[^<]*<\/title>/, `<title>${escHtml(title)}</title>`);
    if (desc) {
      if (/<meta name="description"/.test(html)) {
        html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escHtml(desc)}"`);
      } else {
        html = html.replace("</head>", `  <meta name="description" content="${escHtml(desc)}" />\n</head>`);
      }
    }
    if (meta.robots) html = html.replace("</head>", `  <meta name="robots" content="${escHtml(meta.robots)}" />\n</head>`);
    if (meta.ogImage) html = html.replace("</head>", `  <meta property="og:image" content="${escHtml(meta.ogImage)}" />\n</head>`);
    if (meta.canonical) html = html.replace("</head>", `  <link rel="canonical" href="${escHtml(meta.canonical)}" />\n</head>`);
    return html;
  } catch {
    return html;
  }
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist — with SEO injection
  app.use("*", async (req, res) => {
    try {
      const raw = await fs.promises.readFile(path.resolve(distPath, "index.html"), "utf-8");
      const html = await injectSeo(raw, req.path === "/" ? "/" : req.path.replace(/\/$/, ""));
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch {
      res.sendFile(path.resolve(distPath, "index.html"));
    }
  });
}
