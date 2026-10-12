/**
 * GuruKripa Automated Keep-Alive Service
 *
 * Render Free Tier automatically spins down web services if they do not receive
 * any incoming HTTP requests for 15 minutes.
 *
 * This service prevents idle spin-down by sending an automated HTTP ping to the
 * server's public URL every 13 minutes (safely under the 15-minute Render threshold).
 *
 * Render provides process.env.RENDER_EXTERNAL_URL automatically on deployed services.
 * You can also manually configure SERVER_URL or SELF_URL in your environment.
 */

let keepAliveInterval = null;

const PING_INTERVAL_MS = 13 * 60 * 1000; // 13 minutes (Render sleeps at 15 minutes)

export const getTargetUrl = () => {
  const url =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.SERVER_URL ||
    process.env.SELF_URL ||
    process.env.RENDER_SERVICE_URL;

  if (!url) return null;
  return url.trim().replace(/\/$/, "");
};

export const pingHealthEndpoint = async (targetUrl) => {
  const endpoint = `${targetUrl}/api/health`;
  const startTime = Date.now();

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "User-Agent": "GuruKripa-KeepAlive/1.0 (Render Sleep Prevention)",
        "Cache-Control": "no-cache"
      }
    });

    const elapsed = Date.now() - startTime;
    if (res.ok) {
      console.log(`⏱️ [Keep-Alive] Ping successful to ${endpoint} (${res.status} OK in ${elapsed}ms) - Render idle sleep prevented.`);
      return true;
    } else {
      console.warn(`⚠️ [Keep-Alive] Ping to ${endpoint} returned status ${res.status} (${elapsed}ms).`);
      return false;
    }
  } catch (err) {
    console.error(`⚠️ [Keep-Alive] Failed to ping ${endpoint}:`, err.message);
    return false;
  }
};

export const startKeepAlive = () => {
  const targetUrl = getTargetUrl();

  if (!targetUrl) {
    console.log("ℹ️ [Keep-Alive] Inactive: No public URL detected (RENDER_EXTERNAL_URL, SERVER_URL, or SELF_URL not set).");
    console.log("ℹ️ [Keep-Alive] To keep Render awake automatically, set RENDER_EXTERNAL_URL or SERVER_URL in environment.");
    return;
  }

  console.log(`⚡ [Keep-Alive] Active: Pinging ${targetUrl}/api/health every 13 minutes to prevent Render 15-min idle spin-down.`);

  // Clear any existing timer
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }

  // Initial ping 1 minute after boot
  setTimeout(() => {
    pingHealthEndpoint(targetUrl);
  }, 60 * 1000);

  // Periodic ping every 13 minutes
  keepAliveInterval = setInterval(() => {
    pingHealthEndpoint(targetUrl);
  }, PING_INTERVAL_MS);
};

export const stopKeepAlive = () => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log("🛑 [Keep-Alive] Stopped.");
  }
};
