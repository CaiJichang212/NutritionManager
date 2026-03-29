from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional

from database import get_db
from models import User
from schemas import (
    UserRegister, UserLogin, UserResponse, UserUpdate, 
    Token, NutritionCalculationResponse
)
from services.nutrition import calculate_all_nutrition_metrics
from config import settings

router = APIRouter(prefix="/api/auth", tags=["认证"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = settings.ACCESS_TOKEN_EXPIRE_HOURS

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        user_id = int(user_id)
    except (JWTError, ValueError, TypeError):
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    if not user_data.phone and not user_data.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="必须提供手机号或邮箱"
        )
    
    if user_data.phone:
        existing_user = db.query(User).filter(User.phone == user_data.phone).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该手机号已注册"
            )
    
    if user_data.email:
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该邮箱已注册"
            )
    
    hashed_password = get_password_hash(user_data.password)
    
    new_user = User(
        phone=user_data.phone,
        email=user_data.email,
        password_hash=hashed_password,
        nickname=user_data.nickname or (user_data.phone or user_data.email.split("@")[0])
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.id})
    
    return Token(access_token=access_token)

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    if not user_data.phone and not user_data.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="必须提供手机号或邮箱"
        )
    
    user = None
    if user_data.phone:
        user = db.query(User).filter(User.phone == user_data.phone).first()
    elif user_data.email:
        user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )
    
    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )
    
    access_token = create_access_token(data={"sub": user.id})
    
    return Token(access_token=access_token)

@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    update_fields = update_data.model_dump(exclude_unset=True)
    
    for field, value in update_fields.items():
        setattr(current_user, field, value)
    
    if all([
        current_user.gender,
        current_user.age,
        current_user.height,
        current_user.weight,
        current_user.activity_level,
        current_user.goal_type
    ]):
        metrics = calculate_all_nutrition_metrics(
            gender=current_user.gender,
            age=current_user.age,
            height=current_user.height,
            weight=current_user.weight,
            activity_level=current_user.activity_level,
            goal_type=current_user.goal_type
        )
        current_user.bmr = metrics["bmr"]
        current_user.tdee = metrics["tdee"]
        current_user.daily_calorie_goal = metrics["daily_calorie_goal"]
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/nutrition-calculation", response_model=NutritionCalculationResponse)
def calculate_nutrition(
    current_user: User = Depends(get_current_user)
):
    if not all([
        current_user.gender,
        current_user.age,
        current_user.height,
        current_user.weight,
        current_user.activity_level,
        current_user.goal_type
    ]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="请先完善个人信息（性别、年龄、身高、体重、活动水平、目标类型）"
        )
    
    metrics = calculate_all_nutrition_metrics(
        gender=current_user.gender,
        age=current_user.age,
        height=current_user.height,
        weight=current_user.weight,
        activity_level=current_user.activity_level,
        goal_type=current_user.goal_type
    )
    
    return NutritionCalculationResponse(**metrics)
