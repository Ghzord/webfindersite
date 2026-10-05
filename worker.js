// Cloudflare Worker — projeção de envelhecimento com IA (Gemini image editing)
// Variáveis no painel do Worker (Settings > Variables):
//   GEMINI_API_KEY  (Secret)  -> chave gratuita em https://aistudio.google.com/apikey
//   ALLOWED_ORIGIN  (Text)    -> ex.: https://kari094.github.io
const MODEL = 'gemini-2.5-flash-image';

export default {
  async fetch(req, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return json({ erro: 'Método não permitido' }, 405);

    try {
      const form = await req.formData();
      const foto = form.get('foto');
      const anos = Math.min(Math.max(parseInt(form.get('anos')) || 0, 1), 40);
      const idade = parseInt(form.get('idade')) || null;
      if (!foto || !anos) return json({ erro: 'Envie a foto e os anos.' }, 400);
      if (foto.size > 4 * 1024 * 1024) return json({ erro: 'Foto acima de 4 MB.' }, 413);

      const alvo = idade ? ` (cerca de ${idade + anos} anos de idade hoje)` : '';
      const prompt =
        `Edit this photo of a real person who has been missing for ${anos} years` +
        (idade ? `, who was ${idade} years old in the photo` : '') + `. ` +
        `Create a realistic age-progressed photo showing how this same person would plausibly look ${anos} years later${alvo}. ` +
        `Keep the identity recognizable: same face structure, eye color, skin tone, hair color and texture, ethnicity and distinguishing marks. ` +
        `If the person is a child or teenager, apply natural growth toward adulthood (longer face, more defined jaw and nose, adult proportions); ` +
        `if adult, apply gradual aging (skin texture, fine lines, subtle hair changes) proportional to the years. ` +
        `Keep the same framing, head pose, camera angle, lighting and background. Photorealistic, no text, no beautifying filters.`;

      const buf = await foto.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let bin = '';
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));

      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: foto.type || 'image/jpeg', data: btoa(bin) } }] }],
        }),
      });
      if (!r.ok) {
        const detalhe = (await r.text()).slice(0, 500);
        return json({ erro: 'Falha no serviço de IA.', status: r.status, detalhe }, 502);
      }

      const data = await r.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      const img = parts.map(p => p.inlineData || p.inline_data).find(Boolean);
      if (!img) return json({ erro: 'A IA não retornou imagem.' }, 502);

      return json({ imagemUrl: `data:${img.mimeType || img.mime_type};base64,${img.data}` });
    } catch (e) {
      return json({ erro: 'Erro interno.' }, 500);
    }
  },
};
