/**
 * Muschio Dubai & GCC - Legacy Google SEO Redirect Engine
 * 
 * Maps historical Google-indexed URLs (Shopify, WooCommerce, unlocalized paths,
 * legacy category structures, and older product handles) to canonical modern Next.js routes.
 * 
 * Preserves 301 Permanent Redirect status, query parameters (UTM, GCLID),
 * and respects language preferences (en/ar).
 */

export const KNOWN_LOCALES = ["en", "ar"] as const;
export type SupportedLocale = (typeof KNOWN_LOCALES)[number];

// 1. Product Slug Aliases -> Canonical Database Slugs
export const PRODUCT_SLUG_MAP: Record<string, string> = {
  // Creed
  "creed-aventus": "creed-aventus-millesime",
  "aventus": "creed-aventus-millesime",
  "aventus-millesime": "creed-aventus-millesime",
  "creed-aventus-eau-de-parfum": "creed-aventus-millesime",
  "creed-aventus-edp": "creed-aventus-millesime",
  "creed-silver-mountain": "creed-silver-mountain-water",
  "silver-mountain-water": "creed-silver-mountain-water",
  "creed-smw": "creed-silver-mountain-water",
  "green-irish-tweed": "creed-green-irish-tweed",
  "creed-git": "creed-green-irish-tweed",
  "green-irish": "creed-green-irish-tweed",

  // Maison Francis Kurkdjian (MFK)
  "baccarat-rouge-540-extrait": "mfk-baccarat-rouge-540-extrait",
  "baccarat-rouge-540": "mfk-baccarat-rouge-540-extrait",
  "baccarat-rouge": "mfk-baccarat-rouge-540-extrait",
  "baccarat-rouge-540-extrait-de-parfum": "mfk-baccarat-rouge-540-extrait",
  "mfk-baccarat-rouge-540": "mfk-baccarat-rouge-540-extrait",
  "mfk-baccarat-rouge": "mfk-baccarat-rouge-540-extrait",
  "maison-francis-kurkdjian-baccarat-rouge-540": "mfk-baccarat-rouge-540-extrait",
  "grand-soir": "mfk-grand-soir",
  "mfk-grand-soir-eau-de-parfum": "mfk-grand-soir",
  "grand-soir-eau-de-parfum": "mfk-grand-soir",
  "maison-francis-kurkdjian-grand-soir": "mfk-grand-soir",
  "oud-satin-mood": "mfk-oud-satin-mood-extrait",
  "oud-satin-mood-extrait": "mfk-oud-satin-mood-extrait",
  "mfk-oud-satin-mood": "mfk-oud-satin-mood-extrait",
  "maison-francis-kurkdjian-oud-satin-mood": "mfk-oud-satin-mood-extrait",

  // Amouage
  "interlude-53": "amouage-interlude-53-man",
  "interlude-53-man": "amouage-interlude-53-man",
  "amouage-interlude-53": "amouage-interlude-53-man",
  "interlude-man": "amouage-interlude-53-man",
  "amouage-interlude": "amouage-interlude-53-man",
  "guidance": "amouage-guidance-extrait",
  "guidance-extrait": "amouage-guidance-extrait",
  "guidance-46": "amouage-guidance-extrait",
  "amouage-guidance": "amouage-guidance-extrait",
  "reflection-45": "amouage-reflection-45-man",
  "reflection-man": "amouage-reflection-45-man",
  "amouage-reflection-man": "amouage-reflection-45-man",
  "amouage-reflection-45": "amouage-reflection-45-man",
  "reflection-45-man": "amouage-reflection-45-man",
  "jubilation-40": "amouage-jubilation-40-man",
  "jubilation-xxv": "amouage-jubilation-40-man",
  "amouage-jubilation-xxv": "amouage-jubilation-40-man",
  "amouage-jubilation-40": "amouage-jubilation-40-man",
  "jubilation-40-man": "amouage-jubilation-40-man",
  "royal-tobacco": "amouage-royal-tobacco",
  "opus-xiv-royal-tobacco": "amouage-royal-tobacco",
  "amouage-opus-xiv-royal-tobacco": "amouage-royal-tobacco",
  "opus-royal-tobacco": "amouage-royal-tobacco",

  // Roja Parfums
  "elysium": "roja-parfums-elysium-pour-homme-parfum",
  "roja-elysium": "roja-parfums-elysium-pour-homme-parfum",
  "elysium-parfum": "roja-parfums-elysium-pour-homme-parfum",
  "elysium-pour-homme": "roja-parfums-elysium-pour-homme-parfum",
  "roja-parfums-elysium": "roja-parfums-elysium-pour-homme-parfum",
  "amber-aoud": "roja-amber-aoud-parfum",
  "amber-aoud-parfum": "roja-amber-aoud-parfum",
  "roja-amber-aoud": "roja-amber-aoud-parfum",
  "roja-parfums-amber-aoud": "roja-amber-aoud-parfum",
  "enigma": "roja-enigma-pour-homme-parfum",
  "roja-enigma": "roja-enigma-pour-homme-parfum",
  "enigma-pour-homme": "roja-enigma-pour-homme-parfum",
  "creation-e": "roja-enigma-pour-homme-parfum",
  "roja-creation-e": "roja-enigma-pour-homme-parfum",

  // Xerjoff
  "alexandria-ii": "xerjoff-alexandria-ii",
  "alexandria-2": "xerjoff-alexandria-ii",
  "xerjoff-alexandria": "xerjoff-alexandria-ii",
  "naxos": "xerjoff-naxos-1861",
  "xerjoff-naxos": "xerjoff-naxos-1861",
  "1861-naxos": "xerjoff-naxos-1861",
  "x-1861-naxos": "xerjoff-naxos-1861",
  "xerjoff-1861-naxos": "xerjoff-naxos-1861",
  "erba-pura": "xerjoff-erba-pura",
  "xerjoff-erba-pura-eau-de-parfum": "xerjoff-erba-pura",

  // Tom Ford
  "tobacco-vanille": "tom-ford-tobacco-vanille",
  "tom-ford-tobacco-vanilla": "tom-ford-tobacco-vanille",
  "tobacco-vanilla": "tom-ford-tobacco-vanille",
  "tf-tobacco-vanille": "tom-ford-tobacco-vanille",
  "oud-wood": "tom-ford-oud-wood",
  "tom-ford-oud-wood-eau-de-parfum": "tom-ford-oud-wood",
  "tf-oud-wood": "tom-ford-oud-wood",
  "tuscan-leather": "tom-ford-tuscan-leather",
  "tom-ford-tuscan-leather-eau-de-parfum": "tom-ford-tuscan-leather",
  "tf-tuscan-leather": "tom-ford-tuscan-leather",

  // Clive Christian
  "no-1-masculine": "clive-christian-no-1-masculine",
  "clive-christian-no-1": "clive-christian-no-1-masculine",
  "no1-masculine": "clive-christian-no-1-masculine",
  "clive-christian-no1": "clive-christian-no-1-masculine",
  "town-country": "clive-christian-town-country",
  "town-and-country": "clive-christian-town-country",
  "clive-christian-town-and-country": "clive-christian-town-country",
  "1872": "clive-christian-1872-masculine",
  "1872-masculine": "clive-christian-1872-masculine",
  "clive-christian-1872": "clive-christian-1872-masculine",

  // Parfums de Marly
  "layton": "parfums-de-marly-layton",
  "pdm-layton": "parfums-de-marly-layton",
  "parfums-de-marly-layton-eau-de-parfum": "parfums-de-marly-layton",
  "delina": "parfums-de-marly-delina-exclusif",
  "delina-exclusif": "parfums-de-marly-delina-exclusif",
  "pdm-delina": "parfums-de-marly-delina-exclusif",

  // Kilian
  "angels-share": "kilian-angels-share",
  "by-kilian-angels-share": "kilian-angels-share",
  "angel-share": "kilian-angels-share",
  "kilian-angel-share": "kilian-angels-share",

  // Initio
  "oud-for-greatness": "initio-oud-for-greatness",
  "initio-ofg": "initio-oud-for-greatness",
  "initio-parfums-oud-for-greatness": "initio-oud-for-greatness",

  // Nishane
  "hacivat": "nishane-hacivat-extrait",
  "nishane-hacivat": "nishane-hacivat-extrait",
  "hacivat-extrait": "nishane-hacivat-extrait",

  // Frederic Malle
  "portrait-of-a-lady": "frederic-malle-portrait-of-a-lady",
  "frederic-malle-poal": "frederic-malle-portrait-of-a-lady",
  "poal": "frederic-malle-portrait-of-a-lady",
};

// 2. Brand Slug Aliases -> Canonical Database Slugs
export const BRAND_SLUG_MAP: Record<string, string> = {
  "amouage": "amouage",
  "amouage-oman": "amouage",
  "amouage-1019": "amouage",
  "maison-francis-kurkdjian": "maison-francis-kurkdjian",
  "mfk": "maison-francis-kurkdjian",
  "francis-kurkdjian": "maison-francis-kurkdjian",
  "maison-francis-kurkdjian-paris": "maison-francis-kurkdjian",
  "kurkdjian": "maison-francis-kurkdjian",
  "roja-parfums": "roja-parfums",
  "roja": "roja-parfums",
  "roja-dove": "roja-parfums",
  "roja-dove-parfums": "roja-parfums",
  "xerjoff": "xerjoff",
  "xerjoff-italy": "xerjoff",
  "xerjoff-casamorati": "xerjoff",
  "tom-ford": "tom-ford",
  "tomford": "tom-ford",
  "tom-ford-beauty": "tom-ford",
  "tom-ford-private-blend": "tom-ford",
  "clive-christian": "clive-christian",
  "clive-christian-perfumes": "clive-christian",
  "clivechristian": "clive-christian",
  "creed": "creed",
  "house-of-creed": "creed",
  "creed-boutique": "creed",
  "acqua-di-parma": "acqua-di-parma",
  "acqua-di-parma-4056": "acqua-di-parma",
  "adp": "acqua-di-parma",
  "parfums-de-marly": "parfums-de-marly",
  "pdm": "parfums-de-marly",
  "marly": "parfums-de-marly",
  "kilian": "kilian",
  "by-kilian": "kilian",
  "kilian-paris": "kilian",
  "initio-parfums-prives": "initio-parfums-prives",
  "initio": "initio-parfums-prives",
  "initio-parfums": "initio-parfums-prives",
  "nishane": "nishane",
  "nishane-istanbul": "nishane",
  "frederic-malle": "frederic-malle",
  "fredericmalle": "frederic-malle",
  "editions-de-parfums-frederic-malle": "frederic-malle",
};

// 3. Note Slug Aliases -> Canonical Database Slugs
export const NOTE_SLUG_MAP: Record<string, string> = {
  "silver-frankincense": "silver-frankincense",
  "frankincense": "silver-frankincense",
  "luban": "silver-frankincense",
  "hojari-frankincense": "silver-frankincense",
  "cambodian-oud": "cambodian-oud",
  "oud": "cambodian-oud",
  "agarwood": "cambodian-oud",
  "oudh": "cambodian-oud",
  "dehnal-oud": "cambodian-oud",
  "taif-rose": "taif-rose",
  "rose": "taif-rose",
  "wardh-taifi": "taif-rose",
  "taifi-rose": "taif-rose",
  "florentine-iris": "florentine-iris",
  "iris": "florentine-iris",
  "orris": "florentine-iris",
  "golden-ambergris": "golden-ambergris",
  "ambergris": "golden-ambergris",
  "amber": "golden-ambergris",
  "anbar": "golden-ambergris",
  "calabrian-bergamot": "calabrian-bergamot",
  "bergamot": "calabrian-bergamot",
  "bourbon-vanilla": "bourbon-vanilla",
  "vanilla": "bourbon-vanilla",
  "madagascar-vanilla": "bourbon-vanilla",
  "kashmiri-saffron": "kashmiri-saffron",
  "saffron": "kashmiri-saffron",
  "zafran": "kashmiri-saffron",
  "french-lavender": "french-lavender",
  "lavender": "french-lavender",
  "ceylon-cinnamon": "ceylon-cinnamon",
  "cinnamon": "ceylon-cinnamon",
  "cognac-accord": "cognac-accord",
  "cognac": "cognac-accord",
  "tuscan-leather": "tuscan-leather",
  "leather": "tuscan-leather",
  "indonesian-patchouli": "indonesian-patchouli",
  "patchouli": "indonesian-patchouli",
  "nutmeg-cardamom": "nutmeg-cardamom",
  "cardamom": "nutmeg-cardamom",
  "nutmeg": "nutmeg-cardamom",
  "turkish-damascena-rose": "turkish-damascena-rose",
  "damascena-rose": "turkish-damascena-rose",
  "sparkling-pineapple": "sparkling-pineapple",
  "pineapple": "sparkling-pineapple",
  "white-musks": "white-musks",
  "white-musk": "white-musks",
  "musk": "white-musks",
  "haitian-vetiver": "haitian-vetiver",
  "vetiver": "haitian-vetiver",
};

// 4. All Known Canonical Product Slugs for Fast Direct Lookup
export const CANONICAL_PRODUCT_SLUGS = new Set([
  "amouage-interlude-53-man",
  "mfk-baccarat-rouge-540-extrait",
  "creed-aventus-millesime",
  "amouage-guidance-extrait",
  "roja-parfums-elysium-pour-homme-parfum",
  "xerjoff-alexandria-ii",
  "tom-ford-tobacco-vanille",
  "clive-christian-no-1-masculine",
  "mfk-grand-soir",
  "mfk-oud-satin-mood-extrait",
  "amouage-reflection-45-man",
  "amouage-jubilation-40-man",
  "amouage-royal-tobacco",
  "roja-amber-aoud-parfum",
  "roja-enigma-pour-homme-parfum",
  "xerjoff-naxos-1861",
  "xerjoff-erba-pura",
  "tom-ford-oud-wood",
  "tom-ford-tuscan-leather",
  "clive-christian-town-country",
  "clive-christian-1872-masculine",
  "creed-silver-mountain-water",
  "creed-green-irish-tweed",
  "parfums-de-marly-layton",
  "parfums-de-marly-delina-exclusif",
  "kilian-angels-share",
  "initio-oud-for-greatness",
  "nishane-hacivat-extrait",
  "frederic-malle-portrait-of-a-lady",
]);

/**
 * Resolves a product slug (handles legacy slug format, brand prefixes, common suffixes).
 */
export function resolveProductSlug(rawSlug: string): string {
  const clean = decodeURIComponent(rawSlug)
    .trim()
    .toLowerCase()
    .replace(/\.html?$/i, "")
    .replace(/[?#].*$/, "");

  // 1. Direct match with canonical
  if (CANONICAL_PRODUCT_SLUGS.has(clean)) {
    return clean;
  }

  // 2. Direct dictionary alias match
  if (PRODUCT_SLUG_MAP[clean]) {
    return PRODUCT_SLUG_MAP[clean];
  }

  // 3. Strip common concentration / packaging descriptors that legacy sites often appended
  const stripped = clean
    .replace(/-(eau-de-parfum|edp|eau-de-toilette|edt|parfum|extrait|cologne|flacon)$/g, "")
    .replace(/-(100ml|50ml|75ml|120ml|250ml|30ml)$/g, "");

  if (PRODUCT_SLUG_MAP[stripped]) {
    return PRODUCT_SLUG_MAP[stripped];
  }

  // 4. Fuzzy / substring search across canonical list
  for (const canonical of CANONICAL_PRODUCT_SLUGS) {
    if (canonical.includes(stripped) || stripped.includes(canonical)) {
      return canonical;
    }
  }

  // Fallback to cleaned slug
  return clean;
}

/**
 * Resolves a brand slug from legacy formats.
 */
export function resolveBrandSlug(rawSlug: string): string {
  const clean = decodeURIComponent(rawSlug).trim().toLowerCase();
  return BRAND_SLUG_MAP[clean] || clean;
}

/**
 * Resolves a scent note slug.
 */
export function resolveNoteSlug(rawSlug: string): string {
  const clean = decodeURIComponent(rawSlug).trim().toLowerCase();
  return NOTE_SLUG_MAP[clean] || clean;
}

/**
 * Inspects any incoming URL and returns the canonical 301 target path if a legacy redirect applies.
 * Returns null if no redirect is necessary.
 */
export function getLegacyRedirect(pathname: string, search = "", cookieLocale?: string): string | null {
  // Normalize pathname
  let cleanPath = pathname.trim();
  if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;

  // Determine active locale: check if path already starts with /en or /ar
  let locale: SupportedLocale = cookieLocale === "ar" ? "ar" : "en";
  let subpath = cleanPath;

  if (cleanPath.startsWith("/en/") || cleanPath === "/en") {
    locale = "en";
    subpath = cleanPath.substring(3) || "/";
  } else if (cleanPath.startsWith("/ar/") || cleanPath === "/ar") {
    locale = "ar";
    subpath = cleanPath.substring(3) || "/";
  }

  // Strip trailing slashes from subpath unless it's just "/"
  if (subpath.length > 1 && subpath.endsWith("/")) {
    subpath = subpath.slice(0, -1);
  }

  let targetSubpath: string | null = null;

  // A. Shopify Nested: /collections/[collection]/products/[slug]
  const shopifyCollProd = subpath.match(/^\/collections\/[^/]+\/products\/(.+)$/i);
  if (shopifyCollProd && shopifyCollProd[1]) {
    const canonicalSlug = resolveProductSlug(shopifyCollProd[1]);
    targetSubpath = `/product/${canonicalSlug}`;
  }

  // B. Product pages: /products/[slug] or /item/[slug] or /items/[slug] or /p/[slug]
  else if (/^\/(?:products|item|items|p)\/(.+)$/i.test(subpath)) {
    const match = subpath.match(/^\/(?:products|item|items|p)\/(.+)$/i);
    if (match && match[1]) {
      const canonicalSlug = resolveProductSlug(match[1]);
      targetSubpath = `/product/${canonicalSlug}`;
    }
  }

  // C. Unlocalized /product/[slug] -> check alias
  else if (/^\/product\/(.+)$/i.test(subpath)) {
    const match = subpath.match(/^\/product\/(.+)$/i);
    if (match && match[1]) {
      const canonicalSlug = resolveProductSlug(match[1]);
      targetSubpath = `/product/${canonicalSlug}`;
    }
  }

  // D. Products index: /products or /catalog or /store -> /shop
  else if (/^\/(products|catalog|store|all-products)$/i.test(subpath)) {
    targetSubpath = "/shop";
  }

  // E. Collections / Categories: /collections/[slug] or /collection/[slug] or /categories/[slug] or /product-category/[slug]
  else if (/^\/(?:collections|collection|categories|category|product-category)(?:\/(.*))?$/i.test(subpath)) {
    const match = subpath.match(/^\/(?:collections|collection|categories|category|product-category)(?:\/(.*))?$/i);
    const slug = match && match[1] ? match[1].trim().toLowerCase() : "";

    if (!slug || slug === "all" || slug === "all-fragrances" || slug === "perfumes" || slug === "fragrances") {
      targetSubpath = "/shop";
    } else if (BRAND_SLUG_MAP[slug]) {
      // Legacy collections by brand (e.g. /collections/creed -> /brands/creed)
      targetSubpath = `/brands/${BRAND_SLUG_MAP[slug]}`;
    } else if (slug === "men" || slug === "mens" || slug === "for-men") {
      targetSubpath = "/shop?gender=MASCULINE";
    } else if (slug === "women" || slug === "womens" || slug === "for-women") {
      targetSubpath = "/shop?gender=FEMININE";
    } else if (slug === "royal-extraits" || slug === "sovereign-icons") {
      targetSubpath = `/shop?collection=${slug}`;
    } else {
      targetSubpath = `/shop?collection=${slug}`;
    }
  }

  // F. Brands: /brand/[slug] or /brands/[slug] or /designer/[slug] or /house/[slug]
  else if (/^\/(?:brand|brands|designer|designers|house|houses)(?:\/(.*))?$/i.test(subpath)) {
    const match = subpath.match(/^\/(?:brand|brands|designer|designers|house|houses)(?:\/(.*))?$/i);
    const slug = match && match[1] ? match[1].trim().toLowerCase() : "";
    if (!slug) {
      targetSubpath = "/brands";
    } else {
      const canonicalBrand = resolveBrandSlug(slug);
      targetSubpath = `/brands/${canonicalBrand}`;
    }
  }

  // G. Notes: /note/[slug] or /notes/[slug] or /ingredient/[slug] or /ingredients/[slug]
  else if (/^\/(?:note|notes|ingredient|ingredients)(?:\/(.*))?$/i.test(subpath)) {
    const match = subpath.match(/^\/(?:note|notes|ingredient|ingredients)(?:\/(.*))?$/i);
    const slug = match && match[1] ? match[1].trim().toLowerCase() : "";
    if (!slug) {
      targetSubpath = "/notes";
    } else {
      const canonicalNote = resolveNoteSlug(slug);
      targetSubpath = `/notes/${canonicalNote}`;
    }
  }

  // H. Pages & Policies
  else if (/^\/(?:pages|page|policies|policy)\/(.+)$/i.test(subpath)) {
    const match = subpath.match(/^\/(?:pages|page|policies|policy)\/(.+)$/i);
    const slug = match && match[1] ? match[1].toLowerCase() : "";
    if (slug.includes("about") || slug.includes("story")) {
      targetSubpath = "/about";
    } else if (slug.includes("contact") || slug.includes("concierge")) {
      targetSubpath = "/contact";
    } else if (slug.includes("shipping") || slug.includes("delivery") || slug.includes("return") || slug.includes("refund")) {
      targetSubpath = "/delivery";
    } else if (slug.includes("terms")) {
      targetSubpath = "/guide#terms";
    } else if (slug.includes("privacy")) {
      targetSubpath = "/guide#privacy";
    } else if (slug.includes("track")) {
      targetSubpath = "/track";
    } else if (slug.includes("authenticity") || slug.includes("guarantee")) {
      targetSubpath = "/guide#authenticity";
    } else if (slug.includes("faq")) {
      targetSubpath = "/guide";
    } else {
      targetSubpath = "/guide";
    }
  }

  // I. Static direct aliases (e.g. /about, /contact, /shipping, etc.)
  else if (/^\/(about|about-us|our-story)$/i.test(subpath)) {
    targetSubpath = "/about";
  } else if (/^\/(contact|contact-us|concierge)$/i.test(subpath)) {
    targetSubpath = "/contact";
  } else if (/^\/(shipping|delivery|shipping-policy|returns)$/i.test(subpath)) {
    targetSubpath = "/delivery";
  } else if (/^\/(terms|terms-and-conditions|terms-of-service)$/i.test(subpath)) {
    targetSubpath = "/guide#terms";
  } else if (/^\/(privacy|privacy-policy)$/i.test(subpath)) {
    targetSubpath = "/guide#privacy";
  } else if (/^\/(faq|faqs)$/i.test(subpath)) {
    targetSubpath = "/guide";
  } else if (/^\/(track|tracking|order-tracking|track-order)$/i.test(subpath)) {
    targetSubpath = "/track";
  } else if (/^\/(discovery-sets|sample-sets|samples|discovery)$/i.test(subpath)) {
    targetSubpath = "/discover/sets";
  } else if (/^\/(ai-sommelier|sommelier|scent-finder|quiz)$/i.test(subpath)) {
    targetSubpath = "/discover/ai";
  } else if (/^\/(blog|blogs|news|articles|journal)$/i.test(subpath)) {
    targetSubpath = "/journal";
  } else if (/^\/(cart|basket)$/i.test(subpath)) {
    targetSubpath = "/cart";
  } else if (/^\/(checkout)$/i.test(subpath)) {
    targetSubpath = "/checkout";
  } else if (/^\/(account|login|register|signin|signup)$/i.test(subpath)) {
    targetSubpath = "/account";
  } else if (/^\/(wishlist)$/i.test(subpath)) {
    targetSubpath = "/wishlist";
  } else if (/^\/(compare)$/i.test(subpath)) {
    targetSubpath = "/compare";
  } else if (/^\/(shop)$/i.test(subpath)) {
    targetSubpath = "/shop";
  }

  // If a target subpath was determined:
  if (targetSubpath) {
    const fullCanonicalTarget = `/${locale}${targetSubpath.startsWith("/") ? targetSubpath : "/" + targetSubpath}`;

    // If query string exists, merge it
    let finalUrl = fullCanonicalTarget;
    if (search) {
      const cleanSearch = search.startsWith("?") ? search.substring(1) : search;
      if (finalUrl.includes("?")) {
        finalUrl += `&${cleanSearch}`;
      } else {
        finalUrl += `?${cleanSearch}`;
      }
    }

    // Only redirect if different from original request path + search
    const currentFull = pathname + (search || "");
    if (currentFull !== finalUrl) {
      return finalUrl;
    }
  }

  return null;
}
