/*
 * MyMealMap Nutrition Insights Engine
 * Estimates nutrient coverage from logged meals and a user's body profile.
 * Results are educational estimates, not diagnoses or medical advice.
 */
(function nutritionEngineFactory(global) {
  'use strict';

  const DISCLAIMER = 'Estimated from logged foods and profile information. Not medical advice.';

  const BASE_TARGETS = {
    protein_g: 50,
    fiber_g: 28,
    vitamin_a_mcg: 800,
    vitamin_c_mg: 82.5,
    vitamin_d_mcg: 15,
    vitamin_e_mg: 15,
    vitamin_k_mcg: 105,
    vitamin_b12_mcg: 2.4,
    folate_mcg: 400,
    calcium_mg: 1000,
    iron_mg: 12,
    magnesium_mg: 370,
    potassium_mg: 3000,
    zinc_mg: 9.5,
    selenium_mcg: 55,
    omega3_g: 1.3
  };

  const NUTRIENT_LABELS = {
    protein_g: 'Protein',
    fiber_g: 'Fiber',
    vitamin_a_mcg: 'Vitamin A',
    vitamin_c_mg: 'Vitamin C',
    vitamin_d_mcg: 'Vitamin D',
    vitamin_e_mg: 'Vitamin E',
    vitamin_k_mcg: 'Vitamin K',
    vitamin_b12_mcg: 'Vitamin B12',
    folate_mcg: 'Folate',
    calcium_mg: 'Calcium',
    iron_mg: 'Iron',
    magnesium_mg: 'Magnesium',
    potassium_mg: 'Potassium',
    zinc_mg: 'Zinc',
    selenium_mcg: 'Selenium',
    omega3_g: 'Omega-3'
  };

  // Approximate values per common serving. These are intentionally conservative.
  const FOOD_PROFILES = [
    { match: ['salmon'], nutrients: { protein_g: 25, vitamin_d_mcg: 11, vitamin_b12_mcg: 3.2, selenium_mcg: 38, omega3_g: 1.8, potassium_mg: 490 } },
    { match: ['sardine'], nutrients: { protein_g: 23, vitamin_d_mcg: 4.8, vitamin_b12_mcg: 8.9, calcium_mg: 325, selenium_mcg: 45, omega3_g: 1.5 } },
    { match: ['tuna'], nutrients: { protein_g: 25, vitamin_b12_mcg: 2.5, selenium_mcg: 68, omega3_g: 0.7, potassium_mg: 320 } },
    { match: ['chicken'], nutrients: { protein_g: 28, vitamin_b12_mcg: 0.3, iron_mg: 1.2, zinc_mg: 2.4, selenium_mcg: 27, potassium_mg: 260 } },
    { match: ['beef', 'steak'], nutrients: { protein_g: 26, vitamin_b12_mcg: 2.5, iron_mg: 2.7, zinc_mg: 5.5, selenium_mcg: 28, potassium_mg: 315 } },
    { match: ['egg'], nutrients: { protein_g: 6.3, vitamin_a_mcg: 80, vitamin_d_mcg: 1.1, vitamin_b12_mcg: 0.6, iron_mg: 0.9, selenium_mcg: 15 } },
    { match: ['tofu'], nutrients: { protein_g: 14, fiber_g: 2, calcium_mg: 250, iron_mg: 3, magnesium_mg: 55, potassium_mg: 235, zinc_mg: 1.5 } },
    { match: ['lentil'], nutrients: { protein_g: 18, fiber_g: 15, folate_mcg: 358, iron_mg: 6.6, magnesium_mg: 71, potassium_mg: 730, zinc_mg: 2.5 } },
    { match: ['bean'], nutrients: { protein_g: 15, fiber_g: 13, folate_mcg: 250, iron_mg: 4, magnesium_mg: 80, potassium_mg: 610, zinc_mg: 2.2 } },
    { match: ['broccoli'], nutrients: { fiber_g: 5, vitamin_a_mcg: 120, vitamin_c_mg: 80, vitamin_k_mcg: 180, folate_mcg: 100, calcium_mg: 60, potassium_mg: 450 } },
    { match: ['spinach'], nutrients: { fiber_g: 4, vitamin_a_mcg: 470, vitamin_c_mg: 28, vitamin_e_mg: 3.7, vitamin_k_mcg: 480, folate_mcg: 260, iron_mg: 6.4, magnesium_mg: 150 } },
    { match: ['avocado'], nutrients: { fiber_g: 10, vitamin_c_mg: 15, vitamin_e_mg: 3.1, vitamin_k_mcg: 31, folate_mcg: 120, magnesium_mg: 43, potassium_mg: 700 } },
    { match: ['orange'], nutrients: { fiber_g: 3, vitamin_a_mcg: 14, vitamin_c_mg: 70, folate_mcg: 40, potassium_mg: 235 } },
    { match: ['kiwi'], nutrients: { fiber_g: 4, vitamin_c_mg: 93, vitamin_e_mg: 1.5, vitamin_k_mcg: 40, folate_mcg: 40, potassium_mg: 310 } },
    { match: ['banana'], nutrients: { fiber_g: 3, vitamin_c_mg: 10, magnesium_mg: 32, potassium_mg: 420 } },
    { match: ['berry', 'berries', 'strawberry', 'blueberry'], nutrients: { fiber_g: 4, vitamin_c_mg: 45, vitamin_e_mg: 1, folate_mcg: 30, potassium_mg: 180 } },
    { match: ['milk'], nutrients: { protein_g: 8, vitamin_a_mcg: 150, vitamin_d_mcg: 2.5, vitamin_b12_mcg: 1.2, calcium_mg: 300, potassium_mg: 370 } },
    { match: ['yogurt'], nutrients: { protein_g: 12, vitamin_b12_mcg: 1, calcium_mg: 300, magnesium_mg: 30, potassium_mg: 380, zinc_mg: 1.7 } },
    { match: ['cheese'], nutrients: { protein_g: 7, vitamin_a_mcg: 90, vitamin_b12_mcg: 0.8, calcium_mg: 200, zinc_mg: 1 } },
    { match: ['almond'], nutrients: { protein_g: 6, fiber_g: 4, vitamin_e_mg: 7.3, calcium_mg: 75, magnesium_mg: 80, potassium_mg: 210 } },
    { match: ['rice'], nutrients: { protein_g: 4, fiber_g: 1, iron_mg: 0.5, magnesium_mg: 19, potassium_mg: 55 } },
    { match: ['brown rice'], nutrients: { protein_g: 5, fiber_g: 3.5, magnesium_mg: 84, potassium_mg: 160, zinc_mg: 1.2 } },
    { match: ['oat'], nutrients: { protein_g: 6, fiber_g: 4, iron_mg: 1.7, magnesium_mg: 63, potassium_mg: 165, zinc_mg: 1.5 } }
  ];

  const FOOD_SUGGESTIONS = {
    protein_g: ['eggs', 'fish', 'chicken', 'tofu', 'lentils'],
    fiber_g: ['beans', 'oats', 'berries', 'broccoli', 'brown rice'],
    vitamin_a_mcg: ['spinach', 'carrots', 'eggs', 'sweet potato'],
    vitamin_c_mg: ['orange', 'kiwi', 'berries', 'broccoli'],
    vitamin_d_mcg: ['salmon', 'sardines', 'eggs', 'fortified milk'],
    vitamin_e_mg: ['almonds', 'avocado', 'spinach'],
    vitamin_k_mcg: ['spinach', 'broccoli', 'leafy greens'],
    vitamin_b12_mcg: ['fish', 'eggs', 'milk', 'yogurt'],
    folate_mcg: ['lentils', 'beans', 'spinach', 'avocado'],
    calcium_mg: ['milk', 'yogurt', 'tofu', 'sardines'],
    iron_mg: ['lean beef', 'lentils', 'beans', 'spinach'],
    magnesium_mg: ['almonds', 'oats', 'spinach', 'beans'],
    potassium_mg: ['banana', 'avocado', 'beans', 'potato'],
    zinc_mg: ['beef', 'chicken', 'beans', 'yogurt'],
    selenium_mcg: ['fish', 'eggs', 'chicken'],
    omega3_g: ['salmon', 'sardines', 'chia seeds', 'walnuts']
  };

  function numberOr(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  function estimateTargets(profile = {}) {
    const weightKg = numberOr(profile.weightKg || profile.weight, 70);
    const heightCm = numberOr(profile.heightCm || profile.height, 170);
    const age = numberOr(profile.age, 35);
    const sex = String(profile.sex || '').toLowerCase();
    const activity = String(profile.activityLevel || 'moderate').toLowerCase();

    const proteinMultiplier = activity === 'high' ? 1.2 : activity === 'low' ? 0.8 : 1.0;
    const proteinTarget = Math.max(45, weightKg * proteinMultiplier);
    const targets = { ...BASE_TARGETS, protein_g: Math.round(proteinTarget) };

    if (sex === 'female') {
      targets.iron_mg = age >= 51 ? 8 : 18;
      targets.magnesium_mg = age >= 31 ? 320 : 310;
      targets.zinc_mg = 8;
      targets.potassium_mg = 2600;
      targets.vitamin_a_mcg = 700;
      targets.vitamin_k_mcg = 90;
      targets.omega3_g = 1.1;
    } else if (sex === 'male') {
      targets.iron_mg = 8;
      targets.magnesium_mg = age >= 31 ? 420 : 400;
      targets.zinc_mg = 11;
      targets.potassium_mg = 3400;
      targets.vitamin_a_mcg = 900;
      targets.vitamin_k_mcg = 120;
      targets.omega3_g = 1.6;
    }

    if (age >= 71) targets.vitamin_d_mcg = 20;

    return {
      targets,
      profileBasis: { age, sex: sex || 'unspecified', heightCm, weightKg, activityLevel: activity },
      disclaimer: DISCLAIMER
    };
  }

  function emptyNutrients() {
    return Object.keys(BASE_TARGETS).reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});
  }

  function addNutrients(target, nutrients, multiplier = 1) {
    Object.entries(nutrients || {}).forEach(([key, value]) => {
      target[key] = (target[key] || 0) + Number(value || 0) * multiplier;
    });
    return target;
  }

  function estimateMeal(meal = {}) {
    const text = `${meal.food_name || meal.foodName || meal.name || ''} ${meal.notes || meal.description || ''}`.toLowerCase();
    const nutrients = emptyNutrients();
    const matches = [];

    FOOD_PROFILES.forEach((profile) => {
      if (profile.match.some((term) => text.includes(term))) {
        addNutrients(nutrients, profile.nutrients);
        matches.push(profile.match[0]);
      }
    });

    const confidence = matches.length >= 2 ? 'medium' : matches.length === 1 ? 'low' : 'needs-confirmation';
    return {
      nutrients,
      matchedFoods: matches,
      confidence,
      disclaimer: DISCLAIMER
    };
  }

  function summarizeMeals(meals = [], profile = {}) {
    const totals = emptyNutrients();
    const confidenceCounts = { medium: 0, low: 0, 'needs-confirmation': 0 };

    meals.forEach((meal) => {
      const estimate = meal.nutrients ? { nutrients: meal.nutrients, confidence: meal.nutrition_confidence || 'medium' } : estimateMeal(meal);
      addNutrients(totals, estimate.nutrients);
      confidenceCounts[estimate.confidence] = (confidenceCounts[estimate.confidence] || 0) + 1;
    });

    const targetResult = estimateTargets(profile);
    const coverage = {};
    Object.entries(targetResult.targets).forEach(([key, target]) => {
      coverage[key] = target > 0 ? Math.round((totals[key] / target) * 100) : 0;
    });

    return { totals, coverage, targets: targetResult.targets, confidenceCounts, disclaimer: DISCLAIMER };
  }

  function buildWeeklyReport(meals = [], profile = {}) {
    const summary = summarizeMeals(meals, profile);
    const sevenDayTargets = Object.fromEntries(Object.entries(summary.targets).map(([key, value]) => [key, value * 7]));
    const weeklyCoverage = {};

    Object.entries(sevenDayTargets).forEach(([key, target]) => {
      weeklyCoverage[key] = target > 0 ? Math.round((summary.totals[key] / target) * 100) : 0;
    });

    const ranked = Object.entries(weeklyCoverage)
      .map(([key, percent]) => ({ key, label: NUTRIENT_LABELS[key] || key, percent }))
      .sort((a, b) => a.percent - b.percent);

    const missing = ranked.filter((item) => item.percent < 70).slice(0, 6);
    const adequate = ranked.filter((item) => item.percent >= 70 && item.percent <= 130);
    const high = ranked.filter((item) => item.percent > 130);

    const nextWeekFoods = [];
    missing.forEach((item) => {
      (FOOD_SUGGESTIONS[item.key] || []).slice(0, 2).forEach((food) => {
        if (!nextWeekFoods.includes(food)) nextWeekFoods.push(food);
      });
    });

    const supplementReview = missing
      .filter((item) => ['vitamin_d_mcg', 'vitamin_b12_mcg', 'iron_mg', 'calcium_mg'].includes(item.key))
      .map((item) => ({
        nutrient: item.label,
        message: `${item.label} appears below the estimated weekly target. Consider reviewing food sources first; supplement use should be checked with a qualified professional.`
      }));

    return {
      periodDays: 7,
      mealsAnalyzed: meals.length,
      totals: summary.totals,
      weeklyTargets: sevenDayTargets,
      coverage: weeklyCoverage,
      missing,
      adequate,
      high,
      nextWeekFoods: nextWeekFoods.slice(0, 10),
      supplementReview,
      confidenceCounts: summary.confidenceCounts,
      disclaimer: DISCLAIMER
    };
  }

  global.MyMealMapNutrition = Object.freeze({
    DISCLAIMER,
    NUTRIENT_LABELS,
    estimateTargets,
    estimateMeal,
    summarizeMeals,
    buildWeeklyReport
  });
})(window);
