/**
 * MailBridge Bootstrap - Session Management
 * In-memory safe session store with automatic TTL garbage collection and secure cookies.
 */

import session from "express-session";

export class SafeSessionStore extends session.Store {
  constructor() {
    super();
    this.sessions = new Map();
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [sid, sess] of this.sessions.entries()) {
        if (sess.expires && sess.expires <= now) {
          this.sessions.delete(sid);
        }
      }
    }, 15 * 60 * 1000);

    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  get(sid, cb) {
    const sess = this.sessions.get(sid);
    if (!sess) return cb(null, null);
    if (sess.expires && sess.expires <= Date.now()) {
      this.sessions.delete(sid);
      return cb(null, null);
    }
    return cb(null, sess.data);
  }

  set(sid, sess, cb) {
    const expires = sess.cookie?.expires
      ? new Date(sess.cookie.expires).getTime()
      : Date.now() + (sess.cookie?.maxAge || 86400000);
    this.sessions.set(sid, { data: sess, expires });
    if (cb) cb(null);
  }

  destroy(sid, cb) {
    this.sessions.delete(sid);
    if (cb) cb(null);
  }

  touch(sid, sess, cb) {
    const existing = this.sessions.get(sid);
    if (existing) {
      const expires = sess.cookie?.expires
        ? new Date(sess.cookie.expires).getTime()
        : Date.now() + (sess.cookie?.maxAge || 86400000);
      existing.expires = expires;
    }
    if (cb) cb(null);
  }
}

/**
 * Configure Express session middleware
 */
export function initSession() {
  const sessionConfig = {
    store: new SafeSessionStore(),
    secret: process.env.JWT_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  return session(sessionConfig);
}

export default initSession;
