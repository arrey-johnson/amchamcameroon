/** Bust Next.js data cache after CMS writes (no-op outside the Next runtime). */
async function bust(...tags: string[]) {
  try {
    const { revalidateTag } = await import("next/cache");
    for (const tag of tags) revalidateTag(tag);
  } catch {
    // Seed scripts / Payload CLI — no Next cache available
  }
}

export const revalidateTags =
  (...tags: string[]) =>
  async () => {
    await bust(...tags);
  };

export const revalidateGlobal =
  (...tags: string[]) =>
  async () => {
    await bust(...tags);
  };
