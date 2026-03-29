from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class GenderEnum(str, Enum):
    male = "male"
    female = "female"
    other = "other"

class ActivityLevelEnum(str, Enum):
    sedentary = "sedentary"
    light = "light"
    moderate = "moderate"
    active = "active"
    very_active = "very_active"

class GoalTypeEnum(str, Enum):
    lose_weight = "lose_weight"
    maintain = "maintain"
    gain_weight = "gain_weight"
    muscle_gain = "muscle_gain"

class MealTypeEnum(str, Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snack = "snack"

class UserRegister(BaseModel):
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str = Field(..., min_length=6)
    nickname: Optional[str] = None
    code: Optional[str] = None

class UserLogin(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    code: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    phone: Optional[str]
    email: Optional[str]
    nickname: Optional[str]
    avatar: Optional[str]
    gender: Optional[GenderEnum]
    age: Optional[int]
    height: Optional[float]
    weight: Optional[float]
    activity_level: Optional[ActivityLevelEnum]
    goal_type: Optional[GoalTypeEnum]
    target_weight: Optional[float]
    health_conditions: List[str] = []
    allergies: List[str] = []
    bmr: Optional[float]
    tdee: Optional[float]
    daily_calorie_goal: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    nickname: Optional[str] = None
    avatar: Optional[str] = None
    gender: Optional[GenderEnum] = None
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    activity_level: Optional[ActivityLevelEnum] = None
    goal_type: Optional[GoalTypeEnum] = None
    target_weight: Optional[float] = None
    health_conditions: Optional[List[str]] = None
    allergies: Optional[List[str]] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class FoodItem(BaseModel):
    food_id: int
    name: str
    amount: float
    unit: str = "g"
    calories: float
    protein: float
    fat: float
    carbs: float

class FoodResponse(BaseModel):
    id: int
    name: str
    brand: Optional[str]
    category: Optional[str]
    barcode: Optional[str]
    calories: float
    protein: float
    fat: float
    carbs: float
    fiber: float
    sugar: float
    sodium: float
    health_score: int
    nova_class: int
    ingredients: List[str] = []
    allergens: List[str] = []
    serving_size: float
    serving_unit: str

    class Config:
        from_attributes = True

class FoodSearchResult(BaseModel):
    id: int
    name: str
    brand: Optional[str]
    category: Optional[str]
    calories: float
    protein: float
    health_score: int

    class Config:
        from_attributes = True

class DietRecordCreate(BaseModel):
    date: datetime
    meal_type: MealTypeEnum
    foods: List[FoodItem]
    notes: Optional[str] = None

class DietRecordUpdate(BaseModel):
    date: Optional[datetime] = None
    meal_type: Optional[MealTypeEnum] = None
    foods: Optional[List[FoodItem]] = None
    notes: Optional[str] = None

class DietRecordResponse(BaseModel):
    id: int
    user_id: int
    date: datetime
    meal_type: MealTypeEnum
    foods: List[dict]
    total_calories: float
    total_protein: float
    total_fat: float
    total_carbs: float
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class DailyNutritionSummary(BaseModel):
    date: str
    total_calories: float
    total_protein: float
    total_fat: float
    total_carbs: float
    calorie_goal: Optional[float]
    records: List[DietRecordResponse]

class AIChatMessage(BaseModel):
    message: str
    context: Optional[dict] = None

class AIChatResponse(BaseModel):
    response: str
    model_used: str

class NutritionCalculationRequest(BaseModel):
    gender: GenderEnum
    age: int
    height: float
    weight: float
    activity_level: ActivityLevelEnum
    goal_type: GoalTypeEnum

class NutritionCalculationResponse(BaseModel):
    bmr: float
    tdee: float
    daily_calorie_goal: float
    protein_goal: float
    fat_goal: float
    carbs_goal: float
