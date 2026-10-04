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

const ADMIN_PAGE_SIZE = 30;
const WHATSAPP_BASE_URL = 'https://wa.me/212';

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

function adminHeaders() {
  return new Headers({
    'Content-Type': 'text/html; charset=UTF-8',
    'Cache-Control': 'private, no-store, max-age=0',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character]);
}

function unauthorizedAdminResponse() {
  const headers = adminHeaders();
  headers.set('WWW-Authenticate', 'Basic realm="Revizy leads", charset="UTF-8"');
  return new Response('Authentication required.', { status: 401, headers });
}

function hasAdminAccess(request, env) {
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) return false;

  const authorization = request.headers.get('Authorization') || '';
  if (!authorization.startsWith('Basic ')) return false;

  try {
    const credentials = atob(authorization.slice(6));
    const divider = credentials.indexOf(':');

    if (divider === -1) return false;

    return credentials.slice(0, divider) === env.ADMIN_USERNAME
      && credentials.slice(divider + 1) === env.ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

function getStudents(studentsJson) {
  try {
    const students = JSON.parse(studentsJson);
    return Array.isArray(students) ? students : [];
  } catch {
    return [];
  }
}

function whatsappLink(row) {
  const phone = String(row.parent_phone || '').replace(/\D/g, '');
  if (!/^0[67]\d{8}$/.test(phone)) return '';

  const text = [
    `سلام ${row.parent_name}،`,
    'توصلنا بطلب الاشتراك ديالك فريفيزي. شكراً على الثقة،',
    'نقدروا نكملو معاك التفعيل عبر واتساب.',
  ].join('\n');

  return `${WHATSAPP_BASE_URL}${phone.slice(1)}?text=${encodeURIComponent(text)}`;
}

function formatCreatedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(value || '—');

  return new Intl.DateTimeFormat('ar-MA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function renderLeadRow(row) {
  const students = getStudents(row.students_json);
  const studentsLabel = students.length
    ? students.map((student) => `${student.name} — ${student.grade}`).join(' · ')
    : '—';
  const link = whatsappLink(row);
  const contact = link
    ? `<a class="contact" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">تواصل عبر واتساب</a>`
    : '<span class="unavailable">رقم غير صالح</span>';

  return `<article class="lead">
    <div class="lead-top">
      <div>
        <strong>${escapeHtml(row.parent_name)}</strong>
        <span>${escapeHtml(row.parent_phone)}</span>
      </div>
      <time>${formatCreatedAt(row.created_at)}</time>
    </div>
    <dl>
      <div><dt>المدينة</dt><dd>${escapeHtml(row.parent_city)}</dd></div>
      <div><dt>الخطة</dt><dd>${escapeHtml(row.plan_name)} · ${escapeHtml(row.price_mad)} درهم</dd></div>
      <div class="students"><dt>الأبناء</dt><dd>${escapeHtml(studentsLabel)}</dd></div>
    </dl>
    ${contact}
  </article>`;
}

function renderAdminPage(leads, total, page, totalPages) {
  const entries = leads.length
    ? leads.map(renderLeadRow).join('')
    : '<p class="empty">ما كاين حتى طلب مسجّل دابا.</p>';
  const previous = page > 1 ? `<a href="/admin?page=${page - 1}">الأحدث</a>` : '<span>الأحدث</span>';
  const next = page < totalPages ? `<a href="/admin?page=${page + 1}">الأقدم</a>` : '<span>الأقدم</span>';

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>طلبات ريفيزي</title>
  <style>
    :root { color-scheme: light; --navy:#20385f; --yellow:#ffb319; --ink:#263852; --muted:#6b7890; --line:#e5dfd2; --paper:#fffdf8; }
    * { box-sizing:border-box; }
    body { margin:0; background:#f6f3eb; color:var(--ink); font-family:Rubik, Tahoma, sans-serif; }
    main { width:min(760px, calc(100% - 32px)); margin:38px auto 64px; }
    header { display:flex; align-items:end; justify-content:space-between; gap:20px; padding:0 4px 20px; border-bottom:3px solid var(--yellow); }
    h1 { margin:0; color:var(--navy); font-size:clamp(1.6rem, 6vw, 2.2rem); }
    header p { margin:7px 0 0; color:var(--muted); font-size:.92rem; }
    .count { color:var(--navy); background:#fff2cf; padding:7px 10px; border-radius:999px; font-weight:700; white-space:nowrap; }
    .list { display:grid; gap:12px; margin-top:20px; }
    .lead { background:var(--paper); border:1px solid var(--line); border-radius:16px; padding:17px; box-shadow:0 4px 12px rgba(32,56,95,.04); }
    .lead-top { display:flex; justify-content:space-between; gap:18px; align-items:start; }
    .lead-top strong { display:block; font-size:1.06rem; color:var(--navy); }
    .lead-top span, time { display:block; margin-top:4px; color:var(--muted); font-size:.84rem; direction:ltr; text-align:right; }
    time { margin:0; direction:rtl; white-space:nowrap; }
    dl { display:grid; grid-template-columns:1fr 1fr; gap:11px 18px; margin:17px 0; }
    dl div { min-width:0; } .students { grid-column:1 / -1; }
    dt { color:var(--muted); font-size:.76rem; margin-bottom:3px; } dd { margin:0; font-size:.92rem; font-weight:600; line-height:1.55; }
    .contact { display:block; width:100%; padding:11px 14px; border-radius:10px; background:#1c9c62; color:#fff; text-decoration:none; font-weight:700; text-align:center; }
    .unavailable { color:#9b6c4b; font-size:.82rem; }
    .empty { margin:28px 0; text-align:center; color:var(--muted); }
    nav { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-top:20px; color:var(--muted); font-size:.88rem; }
    nav a, nav span { padding:8px 12px; border-radius:8px; } nav a { background:var(--navy); color:#fff; text-decoration:none; } nav span { background:#e9e5dc; color:#9498a0; }
    @media (max-width:520px) { main { width:min(100% - 24px, 760px); margin-top:24px; } header { align-items:start; flex-direction:column; gap:12px; } dl { grid-template-columns:1fr; } .students { grid-column:auto; } .lead-top { gap:10px; } time { font-size:.76rem; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div><h1>طلبات الاشتراك</h1><p>متابعة طلبات ريفيزي الجديدة والتواصل مع الآباء.</p></div>
      <span class="count">${total} طلب</span>
    </header>
    <section class="list" aria-label="طلبات الاشتراك">${entries}</section>
    <nav aria-label="التنقل بين الصفحات">${previous}<span>صفحة ${page} من ${totalPages}</span>${next}</nav>
  </main>
</body>
</html>`;
}

async function handleAdmin(request, env, url) {
  if (request.method !== 'GET') {
    return new Response('Method not allowed.', { status: 405, headers: adminHeaders() });
  }

  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) {
    return new Response('Admin is not configured.', { status: 503, headers: adminHeaders() });
  }

  if (!hasAdminAccess(request, env)) {
    return unauthorizedAdminResponse();
  }

  const requestedPage = Number(url.searchParams.get('page') || '1');
  const rawPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  try {
    const countResult = await env.DB.prepare(
      'SELECT COUNT(*) AS total FROM form_submissions WHERE landing_page = ?',
    ).bind('lp1').first();
    const total = Number(countResult?.total || 0);
    const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
    const page = Math.min(rawPage, totalPages);
    const offset = (page - 1) * ADMIN_PAGE_SIZE;
    const result = await env.DB.prepare(`
      SELECT parent_name, parent_phone, parent_city, plan_name, price_mad, students_json, created_at
      FROM form_submissions
      WHERE landing_page = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind('lp1', ADMIN_PAGE_SIZE, offset).all();

    return new Response(renderAdminPage(result.results || [], total, page, totalPages), {
      headers: adminHeaders(),
    });
  } catch {
    return new Response('Unable to load entries.', { status: 500, headers: adminHeaders() });
  }
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    if (url.pathname === '/admin') {
      return handleAdmin(request, env, url);
    }

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
