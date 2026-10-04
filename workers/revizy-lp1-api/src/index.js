const ALLOWED_ORIGINS = new Set([
  'https://revizyapp.com',
  'https://www.revizyapp.com',
]);

const ALLOWED_TURNSTILE_HOSTS = new Set([
  'revizyapp.com',
  'www.revizyapp.com',
]);

const GRADES = new Set([
  'المستوى الأول ابتدائي',
  'المستوى الثاني ابتدائي',
  'المستوى الثالث ابتدائي',
  'المستوى الرابع ابتدائي',
  'المستوى الخامس ابتدائي',
  'المستوى السادس ابتدائي',
]);

// The server owns prices and child counts — never trust prices sent by the browser.
const PLANS = {
  'ابن واحد': { students: 1, price: 249 },
  'ابنان': { students: 2, price: 399 },
  '3 أبناء': { students: 3, price: 449 },
};

function headersFor(origin) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=UTF-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });

  if (ALLOWED_ORIGINS.has(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    headers.set('Access-Control-Max-Age', '86400');
    headers.set('Vary', 'Origin');
  }

  return headers;
}

function json(origin, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: headersFor(origin),
  });
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function normalizeMoroccanPhone(value) {
  const arabicDigits = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  };

  let phone = cleanText(value, 32)
    .replace(/[٠-٩]/g, (digit) => arabicDigits[digit])
    .replace(/[\s().-]/g, '');

  if (phone.startsWith('00212')) phone = `+${phone.slice(2)}`;

  if (/^\+212[67]\d{8}$/.test(phone)) {
    return `0${phone.slice(4)}`;
  }

  if (/^0[67]\d{8}$/.test(phone)) {
    return phone;
  }

  return '';
}

async function verifyTurnstile(token, remoteIp, secret) {
  if (!secret || typeof token !== 'string' || !token || token.length > 2048) {
    return false;
  }

  const formData = new FormData();
  formData.append('secret', secret);
  formData.append('response', token);

  if (remoteIp) {
    formData.append('remoteip', remoteIp);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      },
    );

    const result = await response.json();

    return result?.success === true
      && result.action === 'lp1_activation'
      && ALLOWED_TURNSTILE_HOSTS.has(result.hostname);
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function notifyPushover(env, lead) {
  if (!env.PUSHOVER_APP_TOKEN || !env.PUSHOVER_USER_KEY) return;

  const children = lead.students
    .map((student, index) => `• ${student.name || `اسم الابن ${index + 1}`} — ${student.grade}`)
    .join('\n');

  const message = [
    `الاسم: ${lead.parentName}`,
    `واتساب: ${lead.parentPhone}`,
    `المدينة: ${lead.parentCity}`,
    `الخطة: ${lead.planName} — ${lead.priceMad} درهم`,
    'الأبناء:',
    children,
  ].join('\n').slice(0, 900);

  try {
    const response = await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: new URLSearchParams({
        token: env.PUSHOVER_APP_TOKEN,
        user: env.PUSHOVER_USER_KEY,
        title: 'طلب اشتراك جديد — ريفيزي',
        message,
        priority: '0',
      }),
    });

    if (!response.ok) {
      console.error('Pushover notification failed:', response.status);
    }
  } catch {
    console.error('Pushover notification could not be sent');
  }
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      if (!ALLOWED_ORIGINS.has(origin)) {
        return new Response(null, { status: 403 });
      }

      return new Response(null, {
        status: 204,
        headers: headersFor(origin),
      });
    }

    if (request.method !== 'POST' || url.pathname !== '/') {
      return json(origin, {
        ok: false,
        error: { code: 'NOT_FOUND', message: 'Not found.' },
      }, 404);
    }

    if (!ALLOWED_ORIGINS.has(origin)) {
      return json(origin, {
        ok: false,
        error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Request not allowed.' },
      }, 403);
    }

    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > 20_000) {
      return json(origin, {
        ok: false,
        error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request is too large.' },
      }, 413);
    }

    if (!request.headers.get('Content-Type')?.includes('application/json')) {
      return json(origin, {
        ok: false,
        error: { code: 'INVALID_CONTENT_TYPE', message: 'Invalid request.' },
      }, 415);
    }

    let payload;

    try {
      payload = await request.json();
    } catch {
      return json(origin, {
        ok: false,
        error: { code: 'INVALID_JSON', message: 'Invalid request.' },
      }, 400);
    }

    // Honeypot: silently succeed, but never save bot requests.
    if (cleanText(payload.website, 200)) {
      return json(origin, { ok: true });
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    try {
      const { success } = await env.FORM_LIMITER.limit({
        key: `lp1:${ip}`,
      });

      if (!success) {
        return json(origin, {
          ok: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Please wait a moment before trying again.',
          },
        }, 429);
      }
    } catch {
      return json(origin, {
        ok: false,
        error: { code: 'SERVICE_UNAVAILABLE', message: 'Please try again.' },
      }, 503);
    }

    const isHuman = await verifyTurnstile(
      payload.turnstile_token,
      ip,
      env.TURNSTILE_SECRET_KEY,
    );

    if (!isHuman) {
      return json(origin, {
        ok: false,
        error: { code: 'TURNSTILE_FAILED', message: 'Please retry the verification.' },
      }, 400);
    }

    const parentName = cleanText(payload.parent_name, 100);
    const parentPhone = normalizeMoroccanPhone(payload.parent_phone);
    const parentCity = cleanText(payload.parent_city, 100);
    const planName = cleanText(payload.plan_name, 50);
    const selectedPlan = PLANS[planName];
    const rawStudents = Array.isArray(payload.students) ? payload.students : [];

    if (!parentName || !parentPhone || !parentCity || !selectedPlan) {
      return json(origin, {
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid form data.' },
      }, 422);
    }

    if (rawStudents.length !== selectedPlan.students) {
      return json(origin, {
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid student information.' },
      }, 422);
    }

    const students = rawStudents.map((student, index) => ({
      name: cleanText(student?.name, 100) || `اسم الابن ${index + 1}`,
      grade: cleanText(student?.grade, 100),
    }));

    if (students.some((student) => !GRADES.has(student.grade))) {
      return json(origin, {
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid grade.' },
      }, 422);
    }

    try {
      await env.DB.prepare(`
        INSERT INTO form_submissions (
          landing_page,
          parent_name,
          parent_phone,
          parent_city,
          plan_name,
          price_mad,
          students_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        'lp1',
        parentName,
        parentPhone,
        parentCity,
        planName,
        selectedPlan.price,
        JSON.stringify(students),
      ).run();
    } catch {
      // Do not log parents' personal data or expose database details.
      return json(origin, {
        ok: false,
        error: { code: 'SAVE_FAILED', message: 'Please try again.' },
      }, 500);
    }

    // Deliberately non-blocking: saved leads must still reach the thank-you page
    // even if Pushover is unavailable.
    ctx.waitUntil(notifyPushover(env, {
      parentName,
      parentPhone,
      parentCity,
      planName,
      priceMad: selectedPlan.price,
      students,
    }));

    return json(origin, { ok: true });
  },
};
