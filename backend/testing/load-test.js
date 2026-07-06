import http from 'k6/http';
import { check, sleep, group } from 'k6';
import exec from 'k6/execution';
import crypto from 'k6/crypto';

export const options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '2m', target: 10 },
    { duration: '1m', target: 30 },
    { duration: '1m', target: 60 },
    { duration: '5m', target: 60 },
    { duration: '1m', target: 0 },
  ],

  thresholds: {
    'http_req_failed{phase:measurement}':   ['rate<0.01'],
    'http_req_duration{phase:measurement}': ['p(95)<1000'],
    'checks{phase:measurement}':            ['rate>0.99'],

    'http_req_duration{api:login,phase:measurement}':            ['p(95)<1000'],
    'http_req_duration{api:product_list,phase:measurement}':     ['p(95)<500'],
    'http_req_duration{api:product_detail,phase:measurement}':   ['p(95)<400'],
    'http_req_duration{api:search,phase:measurement}':           ['p(95)<600'],
    'http_req_duration{api:category_list,phase:measurement}':    ['p(95)<300'],
    'http_req_duration{api:category_products,phase:measurement}':['p(95)<500'],
    'http_req_duration{api:cart_add,phase:measurement}':         ['p(95)<500'],
    'http_req_duration{api:order_create,phase:measurement}':     ['p(95)<1000'],
    'http_req_duration{api:order_list,phase:measurement}':       ['p(95)<500'],

    'http_req_duration{api:payment_ipn,phase:measurement}':      ['p(95)<300'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

const VNPAY_HASH_SECRET = __ENV.VNPAY_HASH_SECRET || 'DEMO_HASH_SECRET';
const VNPAY_TMN_CODE    = __ENV.VNPAY_TMN_CODE    || 'DEMO_TMN_CODE';

const WARMUP_DURATION_MS = 240_000;

let token       = null;
let categoryIds = [];

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function phase() {
  return exec.instance.currentTestRunDuration < WARMUP_DURATION_MS
    ? 'warmup'
    : 'measurement';
}

function authHeaders(extraTags = {}) {
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    tags: { phase: phase(), ...extraTags },
  };
}

function parseFirstProductId(body) {
  try {
    const data = JSON.parse(body);
    const items = data.content ?? data.items ?? data.products ?? [];
    return items.length > 0 ? items[random(0, items.length - 1)].id : null;
  } catch (_) {
    return null;
  }
}

function javaUrlEncode(str) {
  return encodeURIComponent(str).replace(/%20/g, '+');
}

function buildVnpayHash(params) {
  const sortedKeys = Object.keys(params).sort();
  const parts = [];
  for (const key of sortedKeys) {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      parts.push(`${javaUrlEncode(key)}=${javaUrlEncode(value)}`);
    }
  }
  const hashData = parts.join('&');
  return crypto.hmac('sha512', VNPAY_HASH_SECRET, hashData, 'hex');
}

function login() {
  const userId = ((__VU - 1) % 100) + 1;
  const email  = `user${userId}@ecommerce.com`;

  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email, password: 'password123' }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { api: 'login', phase: phase() },
    }
  );

  if (res.status !== 200) {
    console.error(`[VU ${__VU}] Login failed ${res.status}: ${res.body}`);
    return null;
  }

  try {
    const body = JSON.parse(res.body);
    const t = body.token ?? body.accessToken ?? body.data?.token ?? body.data?.accessToken;
    if (!t) {
      console.error(`[VU ${__VU}] Token not found in: ${res.body}`);
      return null;
    }
    return t;
  } catch (_) {
    console.error(`[VU ${__VU}] Cannot parse login response: ${res.body}`);
    return null;
  }
}

function browseFlow() {
  group('Browse Flow', () => {
    const listRes = http.get(
      `${BASE_URL}/api/products?page=${random(0, 20)}&size=20`,
      authHeaders({ api: 'product_list' })
    );
    check(listRes, { 'browse ok': r => r.status === 200 });

    const productId = parseFirstProductId(listRes.body) ?? random(1, 200);

    const detailRes = http.get(
      `${BASE_URL}/api/products/${productId}`,
      authHeaders({ api: 'product_detail' })
    );
    check(detailRes, { 'detail ok': r => r.status === 200 });

    sleep(Math.random() * 2 + 0.5);
  });
}

function searchFlow() {
  group('Search Flow', () => {
    const keywords = ['phone', 'laptop', 'shoe', 'watch', 'bag', 'tablet'];
    const keyword  = keywords[random(0, keywords.length - 1)];

    const searchRes = http.get(
      `${BASE_URL}/api/products?search=${keyword}&page=${random(0, 10)}&size=20`,
      authHeaders({ api: 'search' })
    );
    check(searchRes, { 'search ok': r => r.status === 200 });

    const productId = parseFirstProductId(searchRes.body) ?? random(1, 200);

    const detailRes = http.get(
      `${BASE_URL}/api/products/${productId}`,
      authHeaders({ api: 'product_detail' })
    );
    check(detailRes, { 'search detail ok': r => r.status === 200 });

    sleep(Math.random() * 2 + 0.5);
  });
}

function categoryFlow() {
  group('Category Flow', () => {
    if (categoryIds.length === 0) {
      const catRes = http.get(
        `${BASE_URL}/api/categories`,
        authHeaders({ api: 'category_list' })
      );
      check(catRes, { 'category list ok': r => r.status === 200 });

      try {
        const data = JSON.parse(catRes.body);
        const cats = Array.isArray(data) ? data : (data.content ?? data.items ?? []);
        categoryIds = cats.map(c => c.id).filter(Boolean);
      } catch (_) {}
    }

    const categoryId = categoryIds.length > 0
      ? categoryIds[random(0, categoryIds.length - 1)]
      : random(1, 10);

    const productsRes = http.get(
      `${BASE_URL}/api/products?categoryId=${categoryId}&page=${random(0, 5)}&size=20`,
      authHeaders({ api: 'category_products' })
    );
    check(productsRes, { 'category products ok': r => r.status === 200 });

    const productId = parseFirstProductId(productsRes.body);
    if (productId) {
      const detailRes = http.get(
        `${BASE_URL}/api/products/${productId}`,
        authHeaders({ api: 'product_detail' })
      );
      check(detailRes, { 'category detail ok': r => r.status === 200 });
    }

    sleep(Math.random() * 2 + 0.5);
  });
}

function checkoutFlow() {
  group('Checkout Flow', () => {

    const listRes = http.get(
      `${BASE_URL}/api/products?page=${random(0, 5)}&size=20`,
      authHeaders({ api: 'product_list' })
    );
    const productId = parseFirstProductId(listRes.body) ?? random(1, 200);

    const cartInit = http.get(
      `${BASE_URL}/api/cart`,
      authHeaders({ api: 'cart_init' })
    );
    check(cartInit, { 'cart init ok': r => r.status === 200 });

    const cartAdd = http.post(
      `${BASE_URL}/api/cart/items`,
      JSON.stringify({ productId, quantity: random(1, 3) }),
      authHeaders({ api: 'cart_add' })
    );
    const cartOk = check(cartAdd, { 'cart add ok': r => r.status === 200 });

    if (!cartOk) {
      console.warn(`[VU ${__VU}] cart_add failed (${cartAdd.status}), skipping order`);
      return;
    }

    const cartView = http.get(
      `${BASE_URL}/api/cart`,
      authHeaders({ api: 'cart_view' })
    );
    check(cartView, { 'cart view ok': r => r.status === 200 });

    const order = http.post(
      `${BASE_URL}/api/orders`,
      JSON.stringify({ shippingAddress: 'Hanoi, Vietnam', note: 'k6 load test' }),
      authHeaders({ api: 'order_create' })
    );
    const orderOk = check(order, { 'order ok': r => r.status === 200 || r.status === 201 });

    if (orderOk) {
      try {
        const orderBody = JSON.parse(order.body);
        const orderId = orderBody.id;
        const totalAmount = orderBody.totalAmount;

        if (orderId && totalAmount != null) {
          const amountVnpay = Math.round(totalAmount * 100);

          const ipnParams = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: VNPAY_TMN_CODE,
            vnp_Amount: String(amountVnpay),
            vnp_BankCode: 'NCB',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: String(orderId),
            vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
            vnp_ResponseCode: '00',
            vnp_TransactionNo: `${Date.now()}${random(100, 999)}`,
            vnp_TransactionStatus: '00',
            vnp_PayDate: '20260702120000',
          };

          const secureHash = buildVnpayHash(ipnParams);

          const query = Object.keys(ipnParams)
            .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(ipnParams[k])}`)
            .join('&');

          const ipnRes = http.get(
            `${BASE_URL}/api/payment/vnpay/ipn?${query}&vnp_SecureHash=${secureHash}`,
            { tags: { api: 'payment_ipn', phase: phase() } }
          );

          check(ipnRes, {
            'ipn accepted': r => r.status === 200,
            'ipn RspCode 00': r => {
              try { return JSON.parse(r.body).RspCode === '00'; }
              catch (_) { return false; }
            },
          });
        }
      } catch (e) {
        console.error(`[VU ${__VU}] IPN simulation lỗi: ${e}`);
      }
    }

    const orderList = http.get(
      `${BASE_URL}/api/orders/me?page=0&size=10&sort=createdAt,desc`,
      authHeaders({ api: 'order_list' })
    );
    check(orderList, { 'order list ok': r => r.status === 200 });

    sleep(Math.random() * 3 + 1);
  });
}

function orderHistoryFlow() {
  group('Order History Flow', () => {
    const orderList = http.get(
      `${BASE_URL}/api/orders/me?page=${random(0, 3)}&size=10&sort=createdAt,desc`,
      authHeaders({ api: 'order_list' })
    );
    check(orderList, { 'order history ok': r => r.status === 200 });

    sleep(Math.random() * 1.5 + 0.5);
  });
}

export default function () {
  if (!token) {
    token = login();
    if (!token) {
      sleep(2);
      return;
    }
  }

  const r = Math.random();

  if      (r < 0.45) browseFlow();
  else if (r < 0.65) searchFlow();
  else if (r < 0.80) categoryFlow();
  else if (r < 0.90) checkoutFlow();
  else                orderHistoryFlow();
}
