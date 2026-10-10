/**
 * Client-Side Disposable Email Detector for Instant User Feedback
 */

const COMMON_DISPOSABLE_DOMAINS = new Set([
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
  "sharklasers.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.biz",
  "guerrillamail.org",
  "10minutemail.com",
  "10minutemail.net",
  "10minutemail.org",
  "mailinator.com",
  "mailinator.net",
  "mailinator2.com"
]);

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
  /dropmail/i,
  /dispostable/i
];

export function isClientDisposableEmail(email) {
  if (!email || typeof email !== "string") return false;
  const parts = email.toLowerCase().trim().split("@");
  if (parts.length < 2) return false;
  const domain = parts[parts.length - 1].trim();

  if (COMMON_DISPOSABLE_DOMAINS.has(domain)) {
    return true;
  }

  for (const pattern of HEURISTIC_PATTERNS) {
    if (pattern.test(domain)) {
      return true;
    }
  }

  return false;
}
