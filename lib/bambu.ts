const BASE = "https://api.bambulab.com";

export type BambuDevice = {
  dev_id: string;
  name: string;
  online: boolean;
  print_status: string;
  nozzle_diameter?: number;
  dev_product_name?: string;
  dev_model_name?: string;
};

export type BambuLoginResult =
  | { ok: true; token: string; expIso: string }
  | { ok: false; needsCode: true; sessionCookie?: string; debugData?: string };

export async function bambuLogin(
  email: string,
  password: string,
  verifyCode?: string,
  sessionCookie?: string,
): Promise<BambuLoginResult> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 12_000);

  // Com verifyCode: corpo mínimo sem apiError (apiError reinicia o fluxo)
  const body: Record<string, string> = verifyCode
    ? { account: email, password, verifyCode }
    : { account: email, password, apiError: "" };

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  // User-Agent do cliente oficial é necessário para a Bambu processar o verifyCode
  if (verifyCode) headers["User-Agent"] = "bambu-studio";
  if (sessionCookie) headers["Cookie"] = sessionCookie;

  let res: Response;
  try {
    res = await fetch(`${BASE}/v1/user-service/user/login`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeout);
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("abort")) throw new Error("Timeout ao conectar com Bambu Lab");
    throw new Error(`Erro de conexão: ${msg}`);
  }
  clearTimeout(timeout);

  let data: Record<string, unknown> = {};
  try { data = await res.json(); } catch { /* empty body */ }

  const cookies = res.headers.get("set-cookie");
  console.log("[BAMBU] status:", res.status, "cookies:", cookies, "body:", JSON.stringify(data));

  if (!res.ok) {
    const msg = (data.message ?? data.error ?? data.msg ?? `HTTP ${res.status}`) as string;
    throw new Error(String(msg));
  }

  // Verifica token ANTES de checar loginType
  const token = (data.accessToken ?? data.token) as string | undefined;
  if (token) {
    const exp = new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString();
    return { ok: true, token, expIso: exp };
  }

  if (data.loginType === "verifyCode") {
    return { ok: false, needsCode: true, sessionCookie: cookies ?? undefined, debugData: JSON.stringify(data) };
  }

  throw new Error(String(data.message ?? data.error ?? "Login falhou — resposta inesperada da Bambu Lab"));
}

export async function bambuGetDevices(token: string): Promise<BambuDevice[]> {
  const res = await fetch(`${BASE}/v1/iot-service/api/user/device`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.devices ?? data.message ?? []) as BambuDevice[];
}

export function printStatusLabel(status: string): string {
  const map: Record<string, string> = {
    IDLE: "Aguardando",
    RUNNING: "Imprimindo",
    PAUSE: "Pausada",
    PAUSED: "Pausada",
    FAILED: "Falha",
    FINISH: "Concluído",
    FINISHED: "Concluído",
    PREPARE: "Preparando",
  };
  return map[status?.toUpperCase()] ?? status ?? "Desconhecido";
}
