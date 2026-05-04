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

export async function bambuLogin(email: string, password: string): Promise<{ token: string; expIso: string }> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 12_000);

  let res: Response;
  try {
    res = await fetch(`${BASE}/v1/user-service/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account: email, password, apiError: "" }),
      signal: ctrl.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeout);
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort") || msg.includes("Abort")) throw new Error("Timeout ao conectar com Bambu Lab");
    throw new Error(`Erro de conexão: ${msg}`);
  }
  clearTimeout(timeout);

  let data: Record<string, unknown> = {};
  try { data = await res.json(); } catch { /* empty body */ }

  if (!res.ok) {
    const msg = (data.message ?? data.error ?? data.msg ?? `HTTP ${res.status}`) as string;
    throw new Error(String(msg));
  }

  if (data.loginType === "verifyCode") {
    throw new Error("Bambu enviou um código de verificação para seu e-mail. Contas com verificação em duas etapas não são suportadas pelo monitor automático.");
  }

  const token = (data.accessToken ?? data.token) as string | undefined;
  if (!token) {
    throw new Error(String(data.message ?? data.error ?? "Login falhou — resposta inesperada da Bambu Lab"));
  }

  const exp = new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString();
  return { token, expIso: exp };
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
