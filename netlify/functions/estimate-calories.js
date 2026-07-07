const OPENAI_URL = 'https://api.openai.com/v1/responses';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json(503, { error: 'AI calorie estimation is not configured yet.' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const imageUrl = body.image_url;
    if (!imageUrl || (!imageUrl.startsWith('data:image/') && !imageUrl.startsWith('https://'))) {
      return json(400, { error: 'Please add a food photo first.' });
    }

    const hint = String(body.food_name || '').slice(0, 180);
    const descriptionContext = String(body.description_context || '').slice(0, 500);
    const portion = ['small', 'regular', 'large'].includes(body.portion_size) ? body.portion_size : 'regular';
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_VISION_MODEL || 'gpt-4.1-mini',
        input: [{
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `Estimate calories and key nutrients in this food photo. Food hint: ${hint || 'none'}. Extra user context: ${descriptionContext || 'none'}. Portion selected by user: ${portion}. Use the user context to refine ingredients when it matches the photo, such as milk type, sauce, toppings, or preparation details. Identify visible foods, estimate realistic portions, include likely cooking oil or sauce when visible, and state uncertainty. Also estimate total fiber (grams), iron (milligrams), calcium (milligrams), and vitamin D (micrograms) for the full plate, using standard nutrition references. This is a nutrition estimate, not medical advice.`
            },
            { type: 'input_image', image_url: imageUrl }
          ]
        }],
        text: {
          format: {
            type: 'json_schema',
            name: 'food_calorie_estimate',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                foods: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      name: { type: 'string' },
                      portion: { type: 'string' },
                      calories: { type: 'integer', minimum: 0, maximum: 5000 }
                    },
                    required: ['name', 'portion', 'calories']
                  }
                },
                total_calories: { type: 'integer', minimum: 0, maximum: 10000 },
                fiber_g: { type: 'number', minimum: 0, maximum: 200 },
                iron_mg: { type: 'number', minimum: 0, maximum: 100 },
                calcium_mg: { type: 'number', minimum: 0, maximum: 3000 },
                vitamin_d_mcg: { type: 'number', minimum: 0, maximum: 200 },
                confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
                note: { type: 'string' }
              },
              required: ['foods', 'total_calories', 'fiber_g', 'iron_mg', 'calcium_mg', 'vitamin_d_mcg', 'confidence', 'note']
            }
          }
        }
      })
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('OpenAI calorie estimate failed', response.status, result?.error?.message);
      return json(502, { error: 'The AI estimate is temporarily unavailable.' });
    }

    const outputText = result.output
      ?.flatMap((item) => item.content || [])
      .find((item) => item.type === 'output_text')?.text;
    if (!outputText) return json(502, { error: 'The AI could not estimate this photo.' });

    const estimate = JSON.parse(outputText);
    return json(200, estimate);
  } catch (error) {
    console.error('Calorie estimation error', error);
    return json(500, { error: 'Could not analyze this food photo.' });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body)
  };
}
