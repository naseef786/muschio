import { describe, expect, it } from "vitest";
import { getLegacyRedirect } from "../../storefront/src/lib/seo-redirects";

describe("About and Contact destinations", () => {
  it.each(["en", "ar"])("keeps canonical %s pages reachable", (locale) => {
    expect(getLegacyRedirect(`/${locale}/about`)).toBeNull();
    expect(getLegacyRedirect(`/${locale}/contact`)).toBeNull();
  });
  it.each([
    ["/about", "/en/about"],
    ["/contact", "/en/contact"],
    ["/en/about-us", "/en/about"],
    ["/ar/contact-us", "/ar/contact"],
    ["/pages/our-story", "/en/about"],
    ["/ar/pages/contact", "/ar/contact"],
    ["/concierge", "/en/contact"],
  ])("routes %s to its dedicated page", (source, destination) => {
    expect(getLegacyRedirect(source)).toBe(destination);
  });
  it("preserves locale and query parameters for old enquiry links", () => {
    expect(getLegacyRedirect("/contact-us", "?topic=gifting", "ar")).toBe(
      "/ar/contact?topic=gifting",
    );
  });
});
