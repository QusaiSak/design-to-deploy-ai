
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function generateCode(
  model: string,
  imageBase64: string,
  description: string
): Promise<string> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'WireframeAI'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: `You are an expert React developer specializing in turning wireframes into code. Generate clean, responsive React code (with Tailwind CSS) based on the uploaded wireframe image. Focus on producing functional components that match the design. Return ONLY the complete React component code without any explanation or markdown.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Convert this wireframe into a React component using Tailwind CSS. The component should be responsive and match the design as closely as possible. Here's the description of what I need: ${description}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate code');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating code:', error);
    throw error;
  }
}
