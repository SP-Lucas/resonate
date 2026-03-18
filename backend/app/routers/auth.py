from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.database import get_db
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

# Demo user credentials seeded when the database is empty
_DEMO_EMAIL = "demo@resonate.msp"
_DEMO_PASSWORD = "demo"
_DEMO_NAME = "Demo User"
_DEMO_ROLE = "admin"


class LoginRequest(BaseModel):
    """JSON body alternative to OAuth2 form for frontend compatibility."""

    email: str
    password: str


async def _ensure_demo_user(db: AsyncSession) -> None:
    """Create the demo admin account if no users exist in the database."""
    count_result = await db.execute(select(User))
    if count_result.scalars().first() is None:
        demo = User(
            email=_DEMO_EMAIL,
            hashed_password=hash_password(_DEMO_PASSWORD),
            name=_DEMO_NAME,
            role=_DEMO_ROLE,
            is_active=True,
        )
        db.add(demo)
        await db.flush()


async def _authenticate_user(email: str, password: str, db: AsyncSession) -> User:
    """Return the User if credentials are valid, else raise 401."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )
    return user


def _issue_token(user: User) -> Token:
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role}
    )
    return Token(access_token=access_token, token_type="bearer")


# ── Endpoints ──────────────────────────────────────────────────────────────────


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> Token:
    """
    OAuth2 password-grant login. Also seeds the demo user when the DB is empty.
    Use `username` field for the email address (standard OAuth2 form convention).
    """
    await _ensure_demo_user(db)
    user = await _authenticate_user(form_data.username, form_data.password, db)
    return _issue_token(user)


@router.post("/login/json", response_model=Token)
async def login_json(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> Token:
    """
    JSON-body login for frontend compatibility.
    Accepts ``{"email": "...", "password": "..."}``.
    """
    await _ensure_demo_user(db)
    user = await _authenticate_user(payload.email, payload.password, db)
    return _issue_token(user)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> User:
    """Return the currently authenticated user's profile."""
    return current_user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Create a new platform user.
    Open registration — add role-guard middleware when deploying to production.
    """
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A user with email '{payload.email}' already exists",
        )

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        name=payload.name,
        role=payload.role,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user
