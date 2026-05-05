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
  | { ok: false; needsCode: true };

export async function bambuLogin(
  email: string,
  password: string,
  verifyCode?: string,
): Promise<BambuLoginResult> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 12_000);

  const body: Record<string, string> = verifyCode
    ? { account: email, password, verifyCode, apiError: "" }
    : { account: email, password, apiError: "" };

  let res: Response;
  try {
    res = await fetch(`${BASE}/v1/user-service/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  console.log("[BAMBU] status:", res.status, "body:", JSON.stringify(data));

  if (!res.ok) {
    const msg = (data.message ?? data.error ?? data.msg ?? `HTTP ${res.status}`) as string;
    throw new Error(String(msg));
  }

  // Verifica token ANTES de checar loginType — Bambu pode retornar ambos
  const token = (data.accessToken ?? data.token) as string | undefined;
  if (token) {
    const exp = new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString();
    return { ok: true, token, expIso: exp };
  }

  if (data.loginType === "verifyCode") {
    if (!verifyCode) {
      const emailRes = await fetch(`${BASE}/v1/user-service/user/sendemail/code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codeType: "verifyCode" }),
      }).catch(() => null);
      console.log("[BAMBU] sendemail status:", emailRes?.status ?? "fetch failed");
    }
    return { ok: false, needsCode: true };
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
