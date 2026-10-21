import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { shouldShowDistrictPlaceholder } from "@/lib/product-release";

/**
 * Serve the static-exported Platform demo from /public/district at clean URLs.
 * Example: /district/demo → /district/demo/index.html
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Product release boundary only: static modules/data still exist. This does not
  // replace authorization. Releasing the district surface restores routing below.
  if (shouldShowDistrictPlaceholder(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/not-released";
    url.search = "";
    return NextResponse.rewrite(url);
  }

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
