module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const url = process.env.AI_API_URL;
    const key = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL;

    if (!url) return res.status(500).json({ error: 'Missing AI_API_URL env' });
    if (!key) return res.status(500).json({ error: 'Missing AI_API_KEY env' });
    if (!model) return res.status(500).json({ error: 'Missing AI_MODEL env' });

    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'No message' });

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: message }]
      })
    });

    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } 
    catch { return res.status(500).json({ error: 'AI returned: ' + text.slice(0, 300) }); }

    if (!r.ok) {
      return res.status(r.status).json({ error: 'AI error', details: data });
    }

    return res.status(200).json(data);

  } catch (e) {
    return res.status(500).json({ error: 'Crash: ' + e.message });
  }
}
