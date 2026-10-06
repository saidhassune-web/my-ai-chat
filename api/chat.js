export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!process.env.AI_API_URL) return res.status(500).json({ error: 'Missing AI_API_URL' });
    if (!process.env.AI_API_KEY) return res.status(500).json({ error: 'Missing AI_API_KEY' });
    if (!process.env.AI_MODEL) return res.status(500).json({ error: 'Missing AI_MODEL' });

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'No message provided' });

    const response = await fetch(process.env.AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Bearer ${process.env.AI_API_KEY}
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL,
        messages: [{ role: "user", content: message }],
        temperature: 0.7
      })
    });

    const text = await response.text();
    
    // Try to parse as JSON, if not, return the raw text error
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: 'AI server returned non-JSON: ' + text.substring(0, 500) });
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: 'AI server error', details: data });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Server crash: ' + error.message });
  }
}
