
export async function api<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const res = await fetch(input, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
        },
        cache: "no-store",
    });
    const json = await res.json();
    if (!json?.success) throw new Error(json?.error || "Request failed");
    return json.data as T;
}