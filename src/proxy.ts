import { NextResponse, type NextRequest } from "next/server";
import { RESERVED_USERNAMES } from "@/lib/reserved-usernames";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only act on /@... paths.
  if (!pathname.startsWith("/@")) {
    return NextResponse.next();
  }

  const rest = pathname.slice(2); // strip "/@"
  if (rest.length === 0) {
    // Bare "/@" — 404
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  const slashIdx = rest.indexOf("/");
  const handleRaw = slashIdx === -1 ? rest : rest.slice(0, slashIdx);
  const tail = slashIdx === -1 ? "" : rest.slice(slashIdx);
  const handle = handleRaw.toLowerCase();

  // Reserved handles short-circuit to 404 to avoid accidental hits
  if (RESERVED_USERNAMES.has(handle)) {
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  // Rewrite to the actual page route
  const url = req.nextUrl.clone();
  url.pathname = `/u/${handle}${tail}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * Run on everything EXCEPT framework internals, API, and the route metadata
     * outputs. Inside the function we still no-op on anything that isn't /@..
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icon|opengraph-image|robots.txt|sitemap.xml).*)",
  ],
};
