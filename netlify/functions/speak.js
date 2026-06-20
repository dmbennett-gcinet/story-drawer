exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
 
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  if (!ELEVENLABS_API_KEY) {
    console.log("ERROR: ELEVENLABS_API_KEY environment variable is not set");
    return { statusCode: 500, body: JSON.stringify({ error: "API key not configured" }) };
  }
 
  console.log("API key found, length:", ELEVENLABS_API_KEY.length);
 
  const VOICE_IDS = {
    "charlie":  "IKne3meq5aSn9XLyUdCD",
    "george":   "JBFqnCBsd6RMkjVDRZzb",
    "matilda":  "XrExE9yKIg1WjnnlVkGX",
    "alice":    "Xb7hH8MSUJpSbSDYk0k2",
  };
 
  let body;
  try {
    body = JSON.parse(event.body);
  } catch(e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }
 
  const { text, voice } = body;
  if (!text || !voice) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing text or voice" }) };
  }
 
  const voiceId = VOICE_IDS[voice] || VOICE_IDS["matilda"];
  console.log("Using voice:", voice, "voiceId:", voiceId);
  console.log("Text length:", text.length);
 
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.8,
            style: 0.6,
            use_speaker_boost: true
          }
        })
      }
    );
 
    console.log("ElevenLabs response status:", response.status);
 
    if (!response.ok) {
      const err = await response.text();
      console.log("ElevenLabs error body:", err);
      return { statusCode: response.status, body: JSON.stringify({ error: err }) };
    }
 
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");
    console.log("Audio generated successfully, size:", arrayBuffer.byteLength);
 
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio: base64Audio })
    };
 
  } catch(err) {
    console.log("Fetch error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
 

