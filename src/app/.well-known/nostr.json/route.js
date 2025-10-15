import json from "@/nip05Names/nostr.json" assert { type: "json" };

export async function GET(req) {
  const { searchParams } = new URL(
    req.url,
    `http://${req.headers.get("host")}`
  );
  const name = searchParams.get("name");

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (name) {
    const result = json.names?.[name] ?? null;

    if (!result) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers,
      });
    }

    return new Response(JSON.stringify({ names: { [name]: result } }), {
      headers,
    });
  }

  return new Response(JSON.stringify({ names: {} }), {
    headers,
  });
}
