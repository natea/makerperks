/**
 * makerperks-bot GitHub App: mint a short-lived installation token and open a PR that
 * adds the submitted program YAML (and the provider YAML if new). No personal token;
 * the App is repo-scoped and revocable. The private key must be PKCS#8 PEM (convert a
 * GitHub-issued PKCS#1 key with: openssl pkcs8 -topk8 -nocrypt -in key.pem).
 */
export interface GitHubEnv {
  GH_APP_ID: string;
  GH_APP_PRIVATE_KEY: string;
  GH_APP_INSTALLATION_ID: string;
  GITHUB_REPO: string; // "owner/repo"
  GITHUB_BASE_BRANCH: string;
}

const API = "https://api.github.com";
const UA = "MakerPerksBot/1.0";

function b64std(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s);
}

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  return b64std(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function pemToDer(pem: string): Uint8Array {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const bin = atob(body);
  const der = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) der[i] = bin.charCodeAt(i);
  return der;
}

async function appJwt(appId: string, privateKeyPem: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(
    new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })),
  );
  const payload = b64url(
    new TextEncoder().encode(
      JSON.stringify({ iat: now - 30, exp: now + 540, iss: appId }),
    ),
  );
  const signingInput = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput),
  );
  return `${signingInput}.${b64url(sig)}`;
}

async function installationToken(env: GitHubEnv): Promise<string> {
  const jwt = await appJwt(env.GH_APP_ID, env.GH_APP_PRIVATE_KEY);
  const res = await fetch(
    `${API}/app/installations/${env.GH_APP_INSTALLATION_ID}/access_tokens`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${jwt}`,
        accept: "application/vnd.github+json",
        "user-agent": UA,
      },
    },
  );
  if (!res.ok)
    throw new Error(
      `installation token failed: ${res.status} ${await res.text()}`,
    );
  return ((await res.json()) as { token: string }).token;
}

function gh(token: string) {
  return (path: string, init: RequestInit = {}) =>
    fetch(`${API}${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${token}`,
        accept: "application/vnd.github+json",
        "user-agent": UA,
        "content-type": "application/json",
        ...(init.headers ?? {}),
      },
    });
}

export interface PrFile {
  path: string;
  content: string;
}

/** True if `path` already exists on the base branch (i.e. a submission updates it). */
export async function fileExistsOnBase(
  env: GitHubEnv,
  path: string,
): Promise<boolean> {
  const token = await installationToken(env);
  const res = await fetch(
    `${API}/repos/${env.GITHUB_REPO}/contents/${encodeURI(path)}?ref=${encodeURIComponent(env.GITHUB_BASE_BRANCH)}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        accept: "application/vnd.github+json",
        "user-agent": UA,
      },
    },
  );
  return res.ok;
}

/** Create a branch, commit the file(s), and open a PR. Returns the PR URL. */
export async function openPr(
  env: GitHubEnv,
  opts: { branch: string; title: string; body: string; files: PrFile[] },
): Promise<{ url: string; number: number }> {
  const token = await installationToken(env);
  const api = gh(token);
  const repo = env.GITHUB_REPO;
  const base = env.GITHUB_BASE_BRANCH;

  // Base SHA
  const refRes = await api(`/repos/${repo}/git/ref/heads/${base}`);
  if (!refRes.ok) throw new Error(`read base ref failed: ${refRes.status}`);
  const baseSha = ((await refRes.json()) as { object: { sha: string } }).object
    .sha;

  // Branch
  const branchRes = await api(`/repos/${repo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${opts.branch}`, sha: baseSha }),
  });
  if (!branchRes.ok && branchRes.status !== 422)
    throw new Error(
      `create branch failed: ${branchRes.status} ${await branchRes.text()}`,
    );

  // Commit each file via the contents API. If the path already exists on the branch
  // (a pre-existing record, or a leftover commit from a retried submission), GitHub
  // requires the current blob `sha` to update it — a create-only PUT 422s with
  // "sha wasn't supplied". So look it up first and update in place when present.
  for (const f of opts.files) {
    const path = encodeURI(f.path);
    let sha: string | undefined;
    const head = await api(
      `/repos/${repo}/contents/${path}?ref=${encodeURIComponent(opts.branch)}`,
    );
    if (head.ok) {
      sha = ((await head.json()) as { sha: string }).sha;
    } else if (head.status !== 404) {
      throw new Error(
        `read ${f.path} failed: ${head.status} ${await head.text()}`,
      );
    }

    const put = await api(`/repos/${repo}/contents/${path}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `${sha ? "Update" : "Add"} ${f.path}`,
        content: b64std(new TextEncoder().encode(f.content)), // contents API: standard base64
        branch: opts.branch,
        ...(sha ? { sha } : {}),
      }),
    });
    if (!put.ok)
      throw new Error(
        `commit ${f.path} failed: ${put.status} ${await put.text()}`,
      );
  }

  // PR
  const prRes = await api(`/repos/${repo}/pulls`, {
    method: "POST",
    body: JSON.stringify({
      title: opts.title,
      head: opts.branch,
      base,
      body: opts.body,
    }),
  });
  if (!prRes.ok)
    throw new Error(`open PR failed: ${prRes.status} ${await prRes.text()}`);
  const pr = (await prRes.json()) as { html_url: string; number: number };
  return { url: pr.html_url, number: pr.number };
}
