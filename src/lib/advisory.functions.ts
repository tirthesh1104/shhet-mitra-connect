import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({
  village: z.string().default(""),
  crop: z.string().default(""),
  lang: z.enum(["mr", "en"]).default("mr"),
  weather: z.string().default(""),
});

export const getDailyAdvisory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { text: fallback(data.lang), source: "fallback" as const };

    try {
      const { createGateway } = await import("./ai-gateway.server");
      const gateway = createGateway(key);
      const langInstr = data.lang === "mr"
        ? "Respond ONLY in Marathi (Devanagari), 2-3 short bullet points, farmer-friendly."
        : "Respond ONLY in English, 2-3 short bullet points, farmer-friendly.";
      const prompt = `You are a farm advisor for Indian smallholder farmers.
Village: ${data.village || "unknown"}
Primary crop: ${data.crop || "mixed"}
Weather now: ${data.weather || "unknown"}
Give today's practical advisory (irrigation, spraying, market, pest watch). ${langInstr}`;

      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        prompt,
      });
      return { text: text.trim(), source: "ai" as const };
    } catch (e) {
      return { text: fallback(data.lang), source: "fallback" as const };
    }
  });

function fallback(lang: "mr" | "en") {
  return lang === "mr"
    ? "• सकाळी पिकांची पाहणी करा\n• मातीतील ओलावा तपासा\n• जवळच्या मंडईचे दर पहा"
    : "• Inspect crops in the morning\n• Check soil moisture\n• Review nearest mandi rates";
}
