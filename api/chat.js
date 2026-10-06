module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    let body = {};
    try { body = JSON.parse(raw); } catch {}
    const message = body.message;
    const r = await fetch(process.env.AI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.AI_API_KEY },
      body: JSON.stringify({ model: process.env.AI_MODEL, messages: [{ role: 'user', content: message }] })
    });
    const txt = await r.text();
    let j; try { j = JSON.parse(txt); } catch { return res.status(500).json({ error: txt.slice(0,400) }); }
    return res.status(200).json(j);
  } catch (e) { return res.status(500).json({ error: e.message }); }
};
