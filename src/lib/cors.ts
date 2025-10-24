export function setCORSHeaders(origin: string | null, resHeaders: Headers) {
    const allowed = (process.env.NEXT_PUBLIC_MOBILE_ALLOWED_ORIGINS || "").split(",").map(s => s.trim());
    if (origin && allowed.includes(origin)) {
        resHeaders.set("Access-Control-Allow-Origin", origin);
        resHeaders.set("Vary", "Origin");
        resHeaders.set("Access-Control-Allow-Credentials", "true");
        resHeaders.set("Access-Control-Allow-Headers", "content-type, authorization");
        resHeaders.set("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
    }
}