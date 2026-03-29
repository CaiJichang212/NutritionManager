from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime, date
from typing import List

from database import get_db
from models import User, DietRecord
from schemas import (
    DietRecordCreate, DietRecordUpdate, DietRecordResponse,
    DailyNutritionSummary, FoodItem
)
from routers.auth import get_current_user

router = APIRouter(prefix="/api/records", tags=["饮食记录"])

def calculate_record_totals(foods: List[FoodItem]) -> dict:
    totals = {
        "calories": 0.0,
        "protein": 0.0,
        "fat": 0.0,
        "carbs": 0.0
    }
    for food in foods:
        ratio = food.amount / 100
        totals["calories"] += food.calories * ratio
        totals["protein"] += food.protein * ratio
        totals["fat"] += food.fat * ratio
        totals["carbs"] += food.carbs * ratio
    return {k: round(v, 2) for k, v in totals.items()}

@router.get("/today", response_model=DailyNutritionSummary)
def get_today_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())
    
    records = db.query(DietRecord).filter(
        and_(
            DietRecord.user_id == current_user.id,
            DietRecord.date >= today_start,
            DietRecord.date <= today_end
        )
    ).order_by(DietRecord.date).all()
    
    total_calories = sum(r.total_calories for r in records)
    total_protein = sum(r.total_protein for r in records)
    total_fat = sum(r.total_fat for r in records)
    total_carbs = sum(r.total_carbs for r in records)
    
    return DailyNutritionSummary(
        date=today.isoformat(),
        total_calories=round(total_calories, 2),
        total_protein=round(total_protein, 2),
        total_fat=round(total_fat, 2),
        total_carbs=round(total_carbs, 2),
        calorie_goal=current_user.daily_calorie_goal,
        records=[DietRecordResponse.model_validate(r) for r in records]
    )

@router.get("/date/{target_date}", response_model=DailyNutritionSummary)
def get_date_records(
    target_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    date_start = datetime.combine(target_date, datetime.min.time())
    date_end = datetime.combine(target_date, datetime.max.time())
    
    records = db.query(DietRecord).filter(
        and_(
            DietRecord.user_id == current_user.id,
            DietRecord.date >= date_start,
            DietRecord.date <= date_end
        )
    ).order_by(DietRecord.date).all()
    
    total_calories = sum(r.total_calories for r in records)
    total_protein = sum(r.total_protein for r in records)
    total_fat = sum(r.total_fat for r in records)
    total_carbs = sum(r.total_carbs for r in records)
    
    return DailyNutritionSummary(
        date=target_date.isoformat(),
        total_calories=round(total_calories, 2),
        total_protein=round(total_protein, 2),
        total_fat=round(total_fat, 2),
        total_carbs=round(total_carbs, 2),
        calorie_goal=current_user.daily_calorie_goal,
        records=[DietRecordResponse.model_validate(r) for r in records]
    )

@router.post("", response_model=DietRecordResponse, status_code=201)
def create_record(
    record_data: DietRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    totals = calculate_record_totals(record_data.foods)
    
    new_record = DietRecord(
        user_id=current_user.id,
        date=record_data.date,
        meal_type=record_data.meal_type,
        foods=[food.model_dump() for food in record_data.foods],
        total_calories=totals["calories"],
        total_protein=totals["protein"],
        total_fat=totals["fat"],
        total_carbs=totals["carbs"],
        notes=record_data.notes
    )
    
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    
    return DietRecordResponse.model_validate(new_record)

@router.put("/{record_id}", response_model=DietRecordResponse)
def update_record(
    record_id: int,
    record_data: DietRecordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(DietRecord).filter(
        DietRecord.id == record_id,
        DietRecord.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="记录不存在")
    
    update_fields = record_data.model_dump(exclude_unset=True)
    
    if "foods" in update_fields and update_fields["foods"]:
        foods = [FoodItem(**f) if isinstance(f, dict) else f for f in update_fields["foods"]]
        totals = calculate_record_totals(foods)
        update_fields["total_calories"] = totals["calories"]
        update_fields["total_protein"] = totals["protein"]
        update_fields["total_fat"] = totals["fat"]
        update_fields["total_carbs"] = totals["carbs"]
        update_fields["foods"] = [f.model_dump() if hasattr(f, 'model_dump') else f for f in foods]
    
    for field, value in update_fields.items():
        setattr(record, field, value)
    
    db.commit()
    db.refresh(record)
    
    return DietRecordResponse.model_validate(record)

@router.delete("/{record_id}")
def delete_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(DietRecord).filter(
        DietRecord.id == record_id,
        DietRecord.user_id == current_user.id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="记录不存在")
    
    db.delete(record)
    db.commit()
    
    return {"message": "记录已删除"}

@router.get("/history/summary")
def get_history_summary(
    days: int = Query(7, ge=1, le=30),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from datetime import timedelta
    
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)
    
    records = db.query(DietRecord).filter(
        DietRecord.user_id == current_user.id,
        DietRecord.date >= datetime.combine(start_date, datetime.min.time())
    ).all()
    
    daily_summaries = {}
    for record in records:
        record_date = record.date.date().isoformat()
        if record_date not in daily_summaries:
            daily_summaries[record_date] = {
                "date": record_date,
                "calories": 0,
                "protein": 0,
                "fat": 0,
                "carbs": 0
            }
        daily_summaries[record_date]["calories"] += record.total_calories
        daily_summaries[record_date]["protein"] += record.total_protein
        daily_summaries[record_date]["fat"] += record.total_fat
        daily_summaries[record_date]["carbs"] += record.total_carbs
    
    result = []
    current = start_date
    while current <= end_date:
        date_str = current.isoformat()
        if date_str in daily_summaries:
            result.append(daily_summaries[date_str])
        else:
            result.append({
                "date": date_str,
                "calories": 0,
                "protein": 0,
                "fat": 0,
                "carbs": 0
            })
        current += timedelta(days=1)
    
    return {
        "daily_summaries": result,
        "calorie_goal": current_user.daily_calorie_goal
    }
