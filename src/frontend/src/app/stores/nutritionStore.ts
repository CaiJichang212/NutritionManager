import { create } from 'zustand';

export interface MacroTargets {
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sodium?: number;
  sugar?: number;
}

export interface NutritionProgress {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
}

interface NutritionState {
  todayNutrition: NutritionData;
  calorieTarget: number;
  macroTargets: MacroTargets;
  updateNutrition: (data: Partial<NutritionData>) => void;
  setCalorieTarget: (target: number) => void;
  setMacroTargets: (targets: MacroTargets) => void;
  calculateProgress: () => NutritionProgress;
  resetTodayNutrition: () => void;
}

const defaultNutrition: NutritionData = {
  calories: 0,
  protein: 0,
  carbohydrates: 0,
  fat: 0,
  fiber: 0,
};

const defaultMacroTargets: MacroTargets = {
  protein: 150,
  carbohydrates: 250,
  fat: 65,
  fiber: 30,
};

const defaultCalorieTarget = 2000;

export const useNutritionStore = create<NutritionState>((set, get) => ({
  todayNutrition: defaultNutrition,
  calorieTarget: defaultCalorieTarget,
  macroTargets: defaultMacroTargets,

  updateNutrition: (data) =>
    set((state) => ({
      todayNutrition: {
        ...state.todayNutrition,
        ...data,
      },
    })),

  setCalorieTarget: (target) => set({ calorieTarget: target }),

  setMacroTargets: (targets) => set({ macroTargets: targets }),

  calculateProgress: () => {
    const { todayNutrition, calorieTarget, macroTargets } = get();

    return {
      calories: Math.min((todayNutrition.calories / calorieTarget) * 100, 100),
      protein: Math.min((todayNutrition.protein / macroTargets.protein) * 100, 100),
      carbohydrates: Math.min((todayNutrition.carbohydrates / macroTargets.carbohydrates) * 100, 100),
      fat: Math.min((todayNutrition.fat / macroTargets.fat) * 100, 100),
      fiber: macroTargets.fiber
        ? Math.min((todayNutrition.fiber / macroTargets.fiber) * 100, 100)
        : 0,
    };
  },

  resetTodayNutrition: () => set({ todayNutrition: defaultNutrition }),
}));
