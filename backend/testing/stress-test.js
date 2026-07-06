import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';

export const options = {
  stages: [
    { duration: '2m', target: 10  },
    { duration: '2m', target: 20  },
    { duration: '2m', target: 40  },
    { duration: '2m', target: 60  },
    { duration: '2m', target: 80  },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 120 },
    { duration: '2m', target: 0   },
  ],

};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const WARMUP_DURATION_MS = 120_000;

let token = null;

function phase() {
  return exec.instance.currentTestRunDuration < WARMUP_DURATION_MS
    ? 'warmup'
    : 'measurement';
}

function authHeaders(tags = {}) {
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    tags: { phase: phase(), ...tags },
  };
}

function login() {
  const userId = ((__VU - 1) % 100) + 1;
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: `user${userId}@mail.com`, password: 'password123' }),
    { headers: { 'Content-Type': 'application/json' }, tags: { api: 'login' } }
  );

  if (res.status !== 200) return null;

  try {
    const body = JSON.parse(res.body);
    return body.token ?? body.accessToken ?? body.data?.token ?? null;
  } catch (_) { return null; }
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function () {
  if (!token) {
    token = login();
    if (!token) { sleep(2); return; }
  }

  const listRes = http.get(
    `${BASE_URL}/api/products?page=${random(0, 10)}&size=20`,
    authHeaders({ api: 'product_list' })
  );
  check(listRes, { 'list ok': r => r.status === 200 });

  sleep(0.5);

  const cartRes = http.post(
    `${BASE_URL}/api/cart/items`,
    JSON.stringify({ productId: random(1, 200), quantity: 1 }),
    authHeaders({ api: 'cart_add' })
  );
  check(cartRes, { 'cart ok': r => r.status === 200 });

  sleep(Math.random() * 1 + 0.5);
}
