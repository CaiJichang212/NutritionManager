import { create } from 'zustand';

export interface MealType {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  label: string;
}

export interface FoodItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
}

export interface DietRecord {
  id: string;
  date: string;
  mealType: MealType['type'];
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DietState {
  todayRecords: DietRecord[];
  historyRecords: DietRecord[];
  addRecord: (record: DietRecord) => void;
  updateRecord: (id: string, data: Partial<DietRecord>) => void;
  deleteRecord: (id: string) => void;
  getRecordsByDate: (date: string) => DietRecord[];
  setTodayRecords: (records: DietRecord[]) => void;
  setHistoryRecords: (records: DietRecord[]) => void;
}

export const useDietStore = create<DietState>((set, get) => ({
  todayRecords: [],
  historyRecords: [],

  addRecord: (record) =>
    set((state) => {
      const today = new Date().toISOString().split('T')[0];
      if (record.date === today) {
        return {
          todayRecords: [...state.todayRecords, record],
        };
      }
      return {
        historyRecords: [...state.historyRecords, record],
      };
    }),

  updateRecord: (id, data) =>
    set((state) => {
      const updateInArray = (records: DietRecord[]) =>
        records.map((record) =>
          record.id === id
            ? { ...record, ...data, updatedAt: new Date().toISOString() }
            : record
        );

      return {
        todayRecords: updateInArray(state.todayRecords),
        historyRecords: updateInArray(state.historyRecords),
      };
    }),

  deleteRecord: (id) =>
    set((state) => ({
      todayRecords: state.todayRecords.filter((record) => record.id !== id),
      historyRecords: state.historyRecords.filter((record) => record.id !== id),
    })),

  getRecordsByDate: (date) => {
    const { todayRecords, historyRecords } = get();
    const today = new Date().toISOString().split('T')[0];

    if (date === today) {
      return todayRecords;
    }

    return historyRecords.filter((record) => record.date === date);
  },

  setTodayRecords: (records) => set({ todayRecords: records }),

  setHistoryRecords: (records) => set({ historyRecords: records }),
}));
