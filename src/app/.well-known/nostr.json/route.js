import json from "@/nip05Names/nostr.json" assert { type: "json" };

export async function GET(req) {
  const { searchParams } = new URL(req.url, `http://${req.headers.get("host")}`);
  const name = searchParams.get("name");

  if (name) {
    const result = json.names?.[name] ?? null;

    if (!result) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ names: { [name]: result } }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ names: {} }), {
    headers: { "Content-Type": "application/json" },
  });
}
