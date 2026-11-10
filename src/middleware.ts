import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  // Let locale layouts know the path (used to hide public chrome on /portal).
  if (response instanceof NextResponse) {
    response.headers.set("x-pathname", request.nextUrl.pathname);
  }
  return response;
}

export const config = {
  // Skip the Payload admin panel, API routes, Next internals and static files.
  matcher: ["/((?!api|admin|_next|media|.*\\..*).*)"],
};
