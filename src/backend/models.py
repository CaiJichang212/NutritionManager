from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base

class GenderEnum(enum.Enum):
    male = "male"
    female = "female"
    other = "other"

class ActivityLevelEnum(enum.Enum):
    sedentary = "sedentary"
    light = "light"
    moderate = "moderate"
    active = "active"
    very_active = "very_active"

class GoalTypeEnum(enum.Enum):
    lose_weight = "lose_weight"
    maintain = "maintain"
    gain_weight = "gain_weight"
    muscle_gain = "muscle_gain"

class MealTypeEnum(enum.Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snack = "snack"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    email = Column(String(100), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    nickname = Column(String(50), nullable=True)
    avatar = Column(String(500), nullable=True)
    gender = Column(SQLEnum(GenderEnum), nullable=True)
    age = Column(Integer, nullable=True)
    height = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    activity_level = Column(SQLEnum(ActivityLevelEnum), default=ActivityLevelEnum.moderate)
    goal_type = Column(SQLEnum(GoalTypeEnum), default=GoalTypeEnum.maintain)
    target_weight = Column(Float, nullable=True)
    health_conditions = Column(JSON, default=list)
    allergies = Column(JSON, default=list)
    bmr = Column(Float, nullable=True)
    tdee = Column(Float, nullable=True)
    daily_calorie_goal = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    diet_records = relationship("DietRecord", back_populates="user")

class Food(Base):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    brand = Column(String(100), nullable=True)
    category = Column(String(50), nullable=True, index=True)
    barcode = Column(String(50), unique=True, index=True, nullable=True)
    calories = Column(Float, default=0)
    protein = Column(Float, default=0)
    fat = Column(Float, default=0)
    carbs = Column(Float, default=0)
    fiber = Column(Float, default=0)
    sugar = Column(Float, default=0)
    sodium = Column(Float, default=0)
    health_score = Column(Integer, default=50)
    nova_class = Column(Integer, default=1)
    ingredients = Column(JSON, default=list)
    allergens = Column(JSON, default=list)
    serving_size = Column(Float, default=100)
    serving_unit = Column(String(20), default="g")
    created_at = Column(DateTime, default=datetime.utcnow)

class DietRecord(Base):
    __tablename__ = "diet_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, nullable=False, index=True)
    meal_type = Column(SQLEnum(MealTypeEnum), nullable=False)
    foods = Column(JSON, nullable=False)
    total_calories = Column(Float, default=0)
    total_protein = Column(Float, default=0)
    total_fat = Column(Float, default=0)
    total_carbs = Column(Float, default=0)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="diet_records")
