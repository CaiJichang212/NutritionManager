from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models import Food
from schemas import FoodResponse, FoodSearchResult

router = APIRouter(prefix="/api/foods", tags=["食物"])

@router.get("/search", response_model=List[FoodSearchResult])
def search_foods(
    q: str = Query(..., min_length=1, description="搜索关键词"),
    category: Optional[str] = Query(None, description="食物分类"),
    limit: int = Query(20, ge=1, le=100, description="返回数量限制"),
    db: Session = Depends(get_db)
):
    query = db.query(Food).filter(Food.name.contains(q))
    
    if category:
        query = query.filter(Food.category == category)
    
    foods = query.order_by(Food.health_score.desc()).limit(limit).all()
    
    return foods

@router.get("/{food_id}", response_model=FoodResponse)
def get_food_detail(
    food_id: int,
    db: Session = Depends(get_db)
):
    food = db.query(Food).filter(Food.id == food_id).first()
    
    if not food:
        raise HTTPException(
            status_code=404,
            detail="食物不存在"
        )
    
    return food

@router.get("/barcode/{barcode}", response_model=FoodResponse)
def get_food_by_barcode(
    barcode: str,
    db: Session = Depends(get_db)
):
    food = db.query(Food).filter(Food.barcode == barcode).first()
    
    if not food:
        raise HTTPException(
            status_code=404,
            detail="未找到该条形码对应的食品"
        )
    
    return food

@router.get("/categories/list", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Food.category).distinct().all()
    return [cat[0] for cat in categories if cat[0]]

@router.get("/popular/list", response_model=List[FoodSearchResult])
def get_popular_foods(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    foods = db.query(Food).order_by(Food.health_score.desc()).limit(limit).all()
    return foods
