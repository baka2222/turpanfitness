import { cookies } from "next/headers";
import type { Lang } from "@/lib/translations";

export async function getLang(): Promise<Lang> {
  const c = (await cookies()).get("tf-lang");
  let val = c?.value as string | undefined;
  if (val === "ky") val = "kg"; // normalize legacy value
  if (val === "ru" || val === "en" || val === "kg") return val as Lang;
  return "ru";
}
