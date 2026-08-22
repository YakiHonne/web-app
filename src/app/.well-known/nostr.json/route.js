import json from "@/nip05Names/nostr.json" assert { type: "json" };
import axios from "axios";

export async function GET(req) {
  const { searchParams } = new URL(
    req.url,
    `http://${req.headers.get("host")}`,
  );
  const name = searchParams.get("name");

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (name) {
    try {
      const result = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/.well-known/nostr.json?name=${encodeURIComponent(name)}`,
        { timeout: 5000 },
      );
      const data = result?.data;

      if (!data?.names || !data.names[name]) {
        return new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
          headers,
        });
      }

      return new Response(JSON.stringify(data), {
        headers,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers,
      });
    }
  }

  return new Response(JSON.stringify({ names: {} }), {
    headers,
  });
}
// import json from "@/nip05Names/nostr.json" assert { type: "json" };

// export async function GET(req) {
//   const { searchParams } = new URL(
//     req.url,
//     `http://${req.headers.get("host")}`,
//   );
//   const name = searchParams.get("name");

//   const headers = {
//     "Content-Type": "application/json",
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "GET",
//     "Access-Control-Allow-Headers": "Content-Type",
//   };

//   if (name) {
//     const result = json.names?.[name] ?? null;

//     if (!result) {
//       return new Response(JSON.stringify({ error: "Not found" }), {
//         status: 404,
//         headers,
//       });
//     }

//     return new Response(JSON.stringify({ names: { [name]: result } }), {
//       headers,
//     });
//   }

//   return new Response(JSON.stringify({ names: {} }), {
//     headers,
//   });
// }
