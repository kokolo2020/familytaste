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
    const notes = String(body.notes || '').slice(0, 240);
    const restaurant = String(body.restaurant_name || '').slice(0, 120);
    const location = String(body.location_name || '').slice(0, 120);
    const ingredientHints = Array.isArray(body.likely_ingredients)
      ? body.likely_ingredients.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 12)
      : [];
    const quickTags = Array.isArray(body.quick_tags)
      ? body.quick_tags.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 12)
      : [];
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
              text: `Estimate calories in this food photo. Food hint: ${hint || 'none'}. Notes: ${notes || 'none'}. Restaurant: ${restaurant || 'none'}. Location: ${location || 'none'}. User-edited likely ingredients: ${ingredientHints.join(', ') || 'none'}. User-selected quick tags: ${quickTags.join(', ') || 'none'}. Portion selected by user: ${portion}. Identify visible foods, estimate realistic portions, include likely cooking oil or sauce when visible, and state uncertainty. Also estimate likely macros plus the most relevant vitamins and minerals for this dish, plus a short list of likely ingredients and useful quick tags for the scan editor. This is a nutrition estimate, not medical advice.`
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
                confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
                note: { type: 'string' },
                likely_ingredients: {
                  type: 'array',
                  maxItems: 8,
                  items: { type: 'string' }
                },
                quick_tags: {
                  type: 'array',
                  maxItems: 8,
                  items: { type: 'string' }
                },
                insight: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    summary: { type: 'string' },
                    highlights: { type: 'array', items: { type: 'string' }, maxItems: 4 },
                    macros: {
                      type: 'object',
                      additionalProperties: false,
                      properties: {
                        protein_g: { type: 'number', minimum: 0, maximum: 1000 },
                        carbs_g: { type: 'number', minimum: 0, maximum: 1000 },
                        fat_g: { type: 'number', minimum: 0, maximum: 1000 },
                        fiber_g: { type: 'number', minimum: 0, maximum: 1000 },
                        sugar_g: { type: 'number', minimum: 0, maximum: 1000 }
                      },
                      required: ['protein_g', 'carbs_g', 'fat_g', 'fiber_g', 'sugar_g']
                    },
                    vitamins: {
                      type: 'array',
                      maxItems: 4,
                      items: {
                        type: 'object',
                        additionalProperties: false,
                        properties: {
                          name: { type: 'string' },
                          amount: { type: 'string' },
                          benefit: { type: 'string' }
                        },
                        required: ['name', 'amount', 'benefit']
                      }
                    },
                    minerals: {
                      type: 'array',
                      maxItems: 4,
                      items: {
                        type: 'object',
                        additionalProperties: false,
                        properties: {
                          name: { type: 'string' },
                          amount: { type: 'string' },
                          benefit: { type: 'string' }
                        },
                        required: ['name', 'amount', 'benefit']
                      }
                    }
                  },
                  required: ['summary', 'highlights', 'macros', 'vitamins', 'minerals']
                }
              },
              required: ['foods', 'total_calories', 'confidence', 'note', 'likely_ingredients', 'quick_tags', 'insight']
            }
          }
        }
      })
    });

    const result = await response.json();
    if (!response.ok) {
      const upstreamMessage = result?.error?.message || 'The AI estimate is temporarily unavailable.';
      console.error('OpenAI calorie estimate failed', response.status, upstreamMessage);
      return json(502, { error: upstreamMessage });
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
