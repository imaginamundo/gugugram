import { createClient as createKVClient } from "@vercel/kv";

export default function createClient() {
  return createKVClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}
