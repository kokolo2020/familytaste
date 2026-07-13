const https = require('node:https');

const USDA_SEARCH_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

const NUTRIENTS = {
  calories: { ids: [1008, 2047, 2048], numbers: ['208'], names: ['energy'] },
  protein_g: { ids: [1003], numbers: ['203'], names: ['protein'] },
  carbs_g: { ids: [1005], numbers: ['205'], names: ['carbohydrate, by difference'] },
  fat_g: { ids: [1004], numbers: ['204'], names: ['total lipid (fat)'] },
  fiber_g: { ids: [1079], numbers: ['291'], names: ['fiber, total dietary'] },
  sodium_mg: { ids: [1093], numbers: ['307'], names: ['sodium, na'] }
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed.' });
  }

  const query = String(event.queryStringParameters?.query || '').trim().slice(0, 120);
  if (query.length < 2) {
    return json(400, { error: 'Enter at least two characters to search USDA foods.' });
  }

  const apiKey = process.env.USDA_FDC_API_KEY || 'DEMO_KEY';

  try {
    const parameters = new URLSearchParams({
      api_key: apiKey,
      query,
      dataType: 'Foundation,Survey (FNDDS),SR Legacy,Branded',
      pageSize: '30',
      pageNumber: '1'
    });
    const response = await requestJson(`${USDA_SEARCH_URL}?${parameters}`);
    const result = response.body;

    if (!response.ok) {
      console.error('USDA food search failed', response.status, result?.error?.message || result?.message);
      const rateLimited = response.status === 429;
      return json(rateLimited ? 429 : 502, {
        error: rateLimited
          ? 'USDA search is busy. Please wait and try again.'
          : 'USDA nutrition search is temporarily unavailable.'
      });
    }

    const foods = (result.foods || [])
      .map(normalizeFood)
      .filter((food) => food.calories !== null)
      .sort((left, right) => rankFood(right, query) - rankFood(left, query))
      .slice(0, 8);
    return json(200, {
      foods,
      total_hits: Number(result.totalHits) || foods.length,
      using_demo_key: apiKey === 'DEMO_KEY'
    });
  } catch (error) {
    console.error('USDA food search error', error);
    return json(500, { error: 'Could not search USDA nutrition data.' });
  }
};

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { family: 4, timeout: 12000 }, (response) => {
      let rawBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { rawBody += chunk; });
      response.on('end', () => {
        try {
          resolve({
            ok: response.statusCode >= 200 && response.statusCode < 300,
            status: response.statusCode,
            body: rawBody ? JSON.parse(rawBody) : {}
          });
        } catch (error) {
          reject(new Error('USDA returned an invalid response.'));
        }
      });
    });
    request.on('timeout', () => request.destroy(new Error('USDA request timed out.')));
    request.on('error', reject);
  });
}

function normalizeFood(food) {
  const nutrientValues = Object.fromEntries(
    Object.entries(NUTRIENTS).map(([key, match]) => [key, findNutrient(food.foodNutrients, match)])
  );
  const servingSize = Number(food.servingSize);
  const servingUnit = String(food.servingSizeUnit || '').toLowerCase();

  return {
    fdc_id: Number(food.fdcId),
    description: String(food.description || 'USDA food'),
    data_type: String(food.dataType || ''),
    brand: String(food.brandName || food.brandOwner || ''),
    category: String(food.foodCategory || ''),
    serving_grams: servingUnit === 'g' && servingSize > 0 ? servingSize : null,
    ...nutrientValues
  };
}

function rankFood(food, query) {
  const description = food.description.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  const typeScores = {
    'Survey (FNDDS)': 70,
    Foundation: 60,
    'SR Legacy': 50,
    Branded: 0
  };
  let score = typeScores[food.data_type] || 0;
  if (description === normalizedQuery) score += 100;
  else if (description.startsWith(normalizedQuery)) score += 50;
  else if (description.includes(normalizedQuery)) score += 25;
  score += Math.max(0, 20 - Math.max(description.length - normalizedQuery.length, 0));
  if (food.data_type === 'Branded' && food.brand) score -= 20;
  return score;
}

function findNutrient(nutrients = [], match) {
  const nutrient = nutrients.find((item) => {
    const id = Number(item.nutrientId || item.nutrient?.id);
    const number = String(item.nutrientNumber || item.nutrient?.number || '');
    const name = String(item.nutrientName || item.nutrient?.name || '').toLowerCase();
    return match.ids.includes(id)
      || match.numbers.includes(number)
      || match.names.some((candidate) => name === candidate);
  });
  const value = Number(nutrient?.value ?? nutrient?.amount);
  return Number.isFinite(value) ? value : null;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300'
    },
    body: JSON.stringify(body)
  };
}
