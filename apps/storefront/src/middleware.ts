import createMiddleware from "next-intl/middleware";
import { locales } from "./i18n";

export default createMiddleware({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
});

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/admin`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
