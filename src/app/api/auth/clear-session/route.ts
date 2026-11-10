import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const COOKIE = "payload-token";

function expireAuthCookie(res: NextResponse) {
  // Must match how the auth cookie was set (path / sameSite / secure),
  // otherwise browsers keep the old value and logout appears broken.
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(COOKIE, "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure,
    maxAge: 0,
    expires: new Date(0),
  });
  // Also clear a non-secure variant in case the cookie was set during local/dev.
  if (secure) {
    res.cookies.set(COOKIE, "", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
      maxAge: 0,
      expires: new Date(0),
    });
  }
}

/**
 * Always expires the Payload auth cookie, then best-effort revokes the
 * current session via the matching collection logout endpoint.
 */
export async function POST(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const origin = new URL(request.url).origin;

  await Promise.allSettled(
    ["member-accounts", "users"].map((collection) =>
      fetch(`${origin}/api/${collection}/logout`, {
        method: "POST",
        headers: {
          cookie,
          "content-type": "application/json",
        },
      }),
    ),
  );

  const res = NextResponse.json({ ok: true });
  expireAuthCookie(res);
  return res;
}
