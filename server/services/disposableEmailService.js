import disposableDomainsList from "disposable-email-domains" with { type: "json" };

/**
 * Curated list of rotating & newly minted disposable email domains
 * (including temp-mail.org active domains, guerrillamail, 10minutemail, etc.)
 */
const ADDITIONAL_DISPOSABLE_DOMAINS = [
  // Temp-mail.org active & rotating domains
  "18lover.com",
  "creedek.com",
  "fufik.com",
  "greencafe24.com",
  "tmail.ws",
  "tmailor.com",
  "mailpoof.com",
  "mohmal.com",
  "mohmal.im",
  "mohmal.in",
  "tempmail.ninja",
  "emailondeck.com",
  "inboxkitten.com",
  "chacuo.net",
  "emailfake.com",
  "dropmail.me",
  "fakemailgenerator.com",
  "generator.email",
  "mytemp.email",
  "temp-mail.org",
  "temp-mail.io",
  "temp-mail.ru",
  "tempmail.com",
  "tempmail.plus",
  "tempmail.net",
  "tempmailo.com",
  "minuteinbox.com",
  "tempail.com",
  "crazymailing.com",
  "nada.ltd",
  "nada.email",
  "getnada.com",
  "abcvg.com",
  "burnermail.io",
  "maildrop.cc",
  "harakirimail.com",
  "dispostable.com",
  "mailcatch.com",
  "trashmail.com",
  "trashmail.net",
  "trashmail.me",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "cool.fr.nf",
  "courriel.fr.nf",
  "moncourrier.fr.nf",
  "monemail.fr.nf",
  "monmail.fr.nf",
  "hide.biz.st",
  "mymail.infos.st",
  "sharklasers.com",
  "guerrillamail.biz",
  "guerrillamail.de",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "pokemail.net",
  "spam4.me",
  "bccto.me",
  "0-mail.com",
  "10minutemail.com",
  "10minutemail.net",
  "10minutemail.org",
  "10minutemail.co.za",
  "mailinator.com",
  "mailinator.net",
  "mailinator2.com",
  "suremail.info",
  "spamfree24.org",
  "binkmail.com",
  "bobmail.info",
  "chammy.info",
  "devnullmail.com",
  "letthemeatspam.com",
  "mailin8r.com",
  "mailinator.org",
  "mailinator.us",
  "notmailinator.com",
  "reconmail.com",
  "safetymail.info",
  "sendspamhere.com",
  "sogetthis.com",
  "spambob.com",
  "spambob.net",
  "spambob.org",
  "spamevader.com",
  "spamevader.net",
  "spamevader.org",
  "spamherelots.com",
  "spamthisplease.com",
  "streetwisemail.com",
  "suremail.info",
  "thisisnotmyrealemail.com",
  "tradermail.info",
  "veryrealemail.com",
  "zippymail.info"
];

// Combine into a high-speed O(1) Set lookup
const disposableSet = new Set(
  [
    ...(Array.isArray(disposableDomainsList) ? disposableDomainsList : []),
    ...ADDITIONAL_DISPOSABLE_DOMAINS
  ].map((d) => d.toLowerCase().trim())
);

// Dynamic heuristic regex patterns to catch rotating disposable variants
const HEURISTIC_PATTERNS = [
  /temp[-_.]?mail/i,
  /disposable/i,
  /throwaway/i,
  /trash[-_.]?mail/i,
  /fake[-_.]?mail/i,
  /fakeinbox/i,
  /10minute/i,
  /minuteinbox/i,
  /guerrilla/i,
  /mailinator/i,
  /sharklaser/i,
  /yopmail/i,
  /burner[-_.]?mail/i,
  /mohmal/i,
  /generator[-_.]?email/i,
  /mytemp/i,
  /dropmail/i,
  /dispostable/i,
  /nada\.ltd/i,
  /nada\.email/i,
  /emailondeck/i,
  /crazymailing/i
];

/**
 * Extracts and cleans the domain from an email address
 * @param {string} email
 * @returns {string} domain in lowercase
 */
export function extractEmailDomain(email) {
  if (!email || typeof email !== "string") return "";
  const parts = email.toLowerCase().trim().split("@");
  if (parts.length < 2) return "";
  return parts[parts.length - 1].trim();
}

/**
 * Checks if an email address is from a temporary / disposable email service
 * @param {string} email
 * @returns {boolean} true if disposable/temporary, false if legitimate
 */
export function isDisposableEmail(email) {
  const domain = extractEmailDomain(email);
  if (!domain) return false;

  // 1. Exact Set Match against 120,000+ domains
  if (disposableSet.has(domain)) {
    return true;
  }

  // 2. Check for subdomains (e.g. sub.temp-mail.org)
  const domainParts = domain.split(".");
  for (let i = 1; i < domainParts.length - 1; i++) {
    const parentDomain = domainParts.slice(i).join(".");
    if (disposableSet.has(parentDomain)) {
      return true;
    }
  }

  // 3. Heuristic pattern match for newly registered rotating burner domains
  for (const pattern of HEURISTIC_PATTERNS) {
    if (pattern.test(domain)) {
      return true;
    }
  }

  return false;
}

/**
 * Dynamically add a custom domain to the blocked set
 * @param {string} domain
 */
export function blockDomain(domain) {
  if (domain && typeof domain === "string") {
    disposableSet.add(domain.toLowerCase().trim());
  }
}

/**
 * Get total number of active blocked disposable domains
 * @returns {number}
 */
export function getBlockedDomainsCount() {
  return disposableSet.size;
}

export const disposableEmailService = {
  isDisposableEmail,
  extractEmailDomain,
  blockDomain,
  getBlockedDomainsCount
};

export default disposableEmailService;
