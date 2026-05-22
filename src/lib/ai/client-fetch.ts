export type AiFetchError = {
  ok: false;
  error: string;
  code?: string;
  status: number;
};

export type AiFetchSuccess<T> = {
  ok: true;
  data: T;
};

export async function postAi<T>(
  url: string,
  body: unknown,
): Promise<AiFetchSuccess<T> | AiFetchError> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, error: "Network error. Try again.", status: 0 };
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = (await res.json()) as Record<string, unknown>;
  } catch {
    return { ok: false, error: "Invalid response from server.", status: res.status };
  }

  if (!res.ok) {
    return {
      ok: false,
      error: String(payload.error ?? "Request failed"),
      code: payload.code as string | undefined,
      status: res.status,
    };
  }

  return { ok: true, data: payload as T };
}

export function aiErrorMessage(err: AiFetchError): string {
  if (err.code === "ai_not_configured") {
    return "AI is not configured. Add MINIMAX_API_KEY to enable this feature.";
  }
  return err.error;
}
