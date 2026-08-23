import type { Adapter } from "@payloadcms/plugin-cloud-storage/types";

type Options = {
  url: string;
  serviceRoleKey: string;
  bucket: string;
};

function joinKey(prefix: string | undefined, filename: string): string {
  return [prefix, filename].filter(Boolean).join("/").replace(/^\/+/, "");
}

/**
 * Payload upload adapter for Supabase Storage via the REST API (service role).
 * Avoids S3 access keys — the project service-role JWT is enough.
 */
export function supabaseStorageAdapter({ url, serviceRoleKey, bucket }: Options): Adapter {
  const base = url.replace(/\/$/, "");
  const authHeaders = {
    Authorization: `Bearer ${serviceRoleKey}`,
    apikey: serviceRoleKey,
  };

  const publicUrl = (key: string) => `${base}/storage/v1/object/public/${bucket}/${key}`;

  return ({ prefix }) => ({
    name: "supabase",
    generateURL: ({ filename, prefix: docPrefix }) =>
      publicUrl(joinKey(docPrefix ?? prefix, filename)),
    handleUpload: async ({ file }) => {
      const key = joinKey(prefix, file.filename);
      const res = await fetch(`${base}/storage/v1/object/${bucket}/${key}`, {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": file.mimeType || "application/octet-stream",
          "x-upsert": "true",
        },
        body: new Uint8Array(file.buffer),
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Supabase upload failed (${res.status}): ${detail || res.statusText}`);
      }
    },
    handleDelete: async ({ filename, doc }) => {
      const key = joinKey(doc.prefix ?? prefix, filename);
      await fetch(`${base}/storage/v1/object/${bucket}/${key}`, {
        method: "DELETE",
        headers: authHeaders,
        signal: AbortSignal.timeout(30_000),
      });
    },
    staticHandler: async (_req, { params }) => {
      const key = joinKey(params.prefix ?? prefix, params.filename);
      const res = await fetch(publicUrl(key));
      if (!res.ok || !res.body) return new Response(null, { status: 404 });
      return new Response(res.body, {
        status: 200,
        headers: {
          "Content-Type": res.headers.get("Content-Type") || "application/octet-stream",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    },
  });
}
