import { createDemo } from './demo.js';
export const isDemo = new URLSearchParams(location.search).get('demo') === '1';
const mock = isDemo ? createDemo() : null;
export async function call(action, payload = {}) {
  if (mock) return mock(action, payload);
  const bridge = window.webkit?.messageHandlers?.terrariumEventV2;
  if (!bridge) throw Error('Hãy mở sự kiện từ app Terrarium đã đăng nhập. Hoặc chọn xem mô phỏng.');
  // Giao thức đề xuất, cần native triển khai WKScriptMessageHandlerWithReply.
  return bridge.postMessage({ version: 2, action, payload });
}
export function requestId() { return crypto.randomUUID(); }
