import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Serve the static-exported Platform demo from /public/district at clean URLs.
 * Example: /district/demo → /district/demo/index.html
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/district")) {
    return NextResponse.next();
  }

  // Real static assets (JS/CSS/images/docs)
  if (
    pathname.startsWith("/district/_next") ||
    pathname.includes(".") // has an extension
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  const base = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  url.pathname = base === "/district" ? "/district/index.html" : `${base}/index.html`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/district", "/district/:path*"],
};
