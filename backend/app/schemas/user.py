import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., max_length=255)
    role: str = Field(default="viewer", pattern="^(admin|manager|technician|viewer)$")


class UserCreate(UserBase):
    password: str = Field(..., min_length=1)


class UserResponse(UserBase):
    id: uuid.UUID
    email: str
    name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: uuid.UUID | None = None
    email: str | None = None
