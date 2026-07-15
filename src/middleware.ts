import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip the Payload admin panel, API routes, Next internals and static files.
  matcher: ["/((?!api|admin|_next|media|.*\\..*).*)"],
};
