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
  const res = await fetch(`${BASE}/v1/user-service/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account: email, password, apiError: "" }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data.accessToken && !data.token) {
    throw new Error(data.message || data.error || "Login falhou");
  }

  const token: string = data.accessToken ?? data.token;
  // Bambu tokens last ~30 days; store expiry as ISO string
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
