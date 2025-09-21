import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import * as pdfjsLib from "npm:pdfjs-dist@4.6.82/legacy/build/pdf.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "*",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { ...corsHeaders } });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: { ...corsHeaders } });
  }

  try {
    const form = await req.formData();
    const file = form.get("file") as unknown as File | null;
    if (!file) {
      return new Response(JSON.stringify({ error: "Missing file" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const buf = new Uint8Array(await file.arrayBuffer());

    const doc = await (pdfjsLib as any).getDocument({
      data: buf,
      // Run without web worker in the Edge (Deno) runtime
      disableWorker: true,
      isEvalSupported: false,
    }).promise;

    let text = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it: any) => ("str" in it ? it.str : "")).join(" ") + "\n";
    }

    return new Response(JSON.stringify({ text }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "parse-failed" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});


