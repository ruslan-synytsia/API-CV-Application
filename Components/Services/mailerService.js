const path = require('path');
const fs = require('fs/promises');
const ejs = require('ejs');
const { Resend } = require('resend');

const TEMPLATE_DIR = path.resolve(__dirname, '..', '..', 'Templates');
const templateCache = new Map();

const extractEmail = (value) => {
  if (!value) return '';
  const match = String(value).match(/<([^>]+)>/);
  return (match ? match[1] : value).trim();
};

const getDomain = (email) => {
  const atIndex = email.lastIndexOf('@');
  return atIndex === -1 ? '' : email.slice(atIndex + 1).toLowerCase();
};

const isBlank = (value) => !value || !String(value).trim();

const stripHtml = (value) =>
  String(value || '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buildDefaultFrom = (fromEnv, domain) => {
  const trimmedFrom = String(fromEnv || '').trim();
  if (trimmedFrom) return trimmedFrom;
  if (domain) return `No Reply <no-reply@${domain}>`;
  throw new Error('RESEND_FROM is missing (or set RESEND_DOMAIN)');
};

const loadTemplate = async (name) => {
  const key = String(name || '').trim();
  if (!key) {
    throw new Error('Template name is required');
  }
  if (templateCache.has(key)) return templateCache.get(key);

  const templatePath = path.join(TEMPLATE_DIR, `${key}.ejs`);
  try {
    const template = await fs.readFile(templatePath, 'utf-8');
    templateCache.set(key, template);
    return template;
  } catch (error) {
    const err = new Error(`Template "${key}" not found at ${templatePath}`);
    err.cause = error;
    throw err;
  }
};

class Mailer {
  constructor({ apiKey, from, domain } = {}) {
    const resolvedApiKey = apiKey || process.env.RESEND_API_KEY;
    if (!resolvedApiKey) {
      throw new Error('RESEND_API_KEY is missing');
    }

    this.domain = String(domain || process.env.RESEND_DOMAIN || '').toLowerCase();
    this.defaultFrom = buildDefaultFrom(from || process.env.RESEND_FROM, this.domain);
    this.resend = new Resend(resolvedApiKey);
  }

  resolveFrom(customFrom) {
    const resolved = isBlank(customFrom) ? this.defaultFrom : String(customFrom).trim();
    const email = extractEmail(resolved);
    const domain = getDomain(email);

    if (!email || !domain) {
      throw new Error(`Invalid "from" email: ${resolved}`);
    }
    if (this.domain && domain !== this.domain) {
      throw new Error(
        `From domain "${domain}" does not match verified domain "${this.domain}"`
      );
    }

    return resolved;
  }

  async renderTemplate(templateName, data) {
    const template = await loadTemplate(templateName);
    return ejs.render(template, data);
  }

  async sendMail({ from, to, email, username, subject, message, temp }) {
    if (isBlank(to)) {
      throw new Error('"to" is required');
    }
    if (isBlank(subject)) {
      throw new Error('"subject" is required');
    }
    if (isBlank(temp)) {
      throw new Error('"temp" is required');
    }

    const resolvedFrom = this.resolveFrom(from);
    const html = await this.renderTemplate(temp, {
      from: resolvedFrom,
      email,
      username,
      subject,
      message
    });
    const text = stripHtml(html);

    const payload = {
      from: resolvedFrom,
      to,
      subject,
      html,
      text
    };

    const replyTo = extractEmail(email || '');
    if (replyTo && replyTo.includes('@')) {
      payload.reply_to = replyTo;
    }

    const { data, error } = await this.resend.emails.send(payload);
    if (error) {
      const err = new Error(error.message || 'Resend send failed');
      err.cause = error;
      throw err;
    }

    return data;
  }
}

module.exports = Mailer;
