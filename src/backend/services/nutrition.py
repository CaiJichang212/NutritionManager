from typing import Dict
from schemas import GenderEnum, ActivityLevelEnum, GoalTypeEnum

ACTIVITY_MULTIPLIERS = {
    ActivityLevelEnum.sedentary: 1.2,
    ActivityLevelEnum.light: 1.375,
    ActivityLevelEnum.moderate: 1.55,
    ActivityLevelEnum.active: 1.725,
    ActivityLevelEnum.very_active: 1.9,
}

GOAL_ADJUSTMENTS = {
    GoalTypeEnum.lose_weight: -500,
    GoalTypeEnum.maintain: 0,
    GoalTypeEnum.gain_weight: 300,
    GoalTypeEnum.muscle_gain: 400,
}

def calculate_bmr(gender: GenderEnum, age: int, height: float, weight: float) -> float:
    if gender == GenderEnum.male:
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    elif gender == GenderEnum.female:
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age
    return round(bmr, 2)

def calculate_tdee(bmr: float, activity_level: ActivityLevelEnum) -> float:
    multiplier = ACTIVITY_MULTIPLIERS.get(activity_level, 1.55)
    return round(bmr * multiplier, 2)

def calculate_daily_calorie_goal(tdee: float, goal_type: GoalTypeEnum) -> float:
    adjustment = GOAL_ADJUSTMENTS.get(goal_type, 0)
    return round(tdee + adjustment, 2)

def calculate_macros(daily_calories: float, goal_type: GoalTypeEnum) -> Dict[str, float]:
    if goal_type == GoalTypeEnum.lose_weight:
        protein_ratio = 0.30
        fat_ratio = 0.25
        carbs_ratio = 0.45
    elif goal_type == GoalTypeEnum.muscle_gain:
        protein_ratio = 0.30
        fat_ratio = 0.25
        carbs_ratio = 0.45
    elif goal_type == GoalTypeEnum.gain_weight:
        protein_ratio = 0.25
        fat_ratio = 0.30
        carbs_ratio = 0.45
    else:
        protein_ratio = 0.20
        fat_ratio = 0.30
        carbs_ratio = 0.50

    protein = round((daily_calories * protein_ratio) / 4, 1)
    fat = round((daily_calories * fat_ratio) / 9, 1)
    carbs = round((daily_calories * carbs_ratio) / 4, 1)

    return {
        "protein": protein,
        "fat": fat,
        "carbs": carbs
    }

def calculate_all_nutrition_metrics(
    gender: GenderEnum,
    age: int,
    height: float,
    weight: float,
    activity_level: ActivityLevelEnum,
    goal_type: GoalTypeEnum
) -> Dict[str, float]:
    bmr = calculate_bmr(gender, age, height, weight)
    tdee = calculate_tdee(bmr, activity_level)
    daily_calorie_goal = calculate_daily_calorie_goal(tdee, goal_type)
    macros = calculate_macros(daily_calorie_goal, goal_type)

    return {
        "bmr": bmr,
        "tdee": tdee,
        "daily_calorie_goal": daily_calorie_goal,
        "protein_goal": macros["protein"],
        "fat_goal": macros["fat"],
        "carbs_goal": macros["carbs"]
    }
