import { NextResponse, type NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only act on /@... paths.
  if (!pathname.startsWith("/@")) {
    return NextResponse.next();
  }

  const rest = pathname.slice(2); // strip "/@"
  if (rest.length === 0) {
    // Bare "/@" — let next render the 404 page
    return NextResponse.rewrite(new URL("/_not-found", req.url));
  }

  const slashIdx = rest.indexOf("/");
  const handleRaw = slashIdx === -1 ? rest : rest.slice(0, slashIdx);
  const tail = slashIdx === -1 ? "" : rest.slice(slashIdx);
  const handle = handleRaw.toLowerCase();

  // Forward to the public creator page. The page itself calls notFound()
  // for missing users (which includes reserved handles, since
  // validateUsernameFormat rejects them at signup so they never reach the
  // users table).
  const url = req.nextUrl.clone();
  url.pathname = `/u/${handle}${tail}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon|opengraph-image|robots.txt|sitemap.xml).*)",
  ],
};
