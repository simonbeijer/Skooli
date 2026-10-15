// Fyller i platshållare i public/index.html innan sidan skickas.
const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function skooliUrlFromEnv(env) {
  return env.SKOOLI_URL || "http://localhost:3000";
}

export function renderIndex(html, skooliUrl) {
  const url = escapeHtml(String(skooliUrl).replace(/\/+$/, ""));
  return html.replaceAll("{{SKOOLI_URL}}", () => url);
}
