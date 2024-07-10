from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class UserUpdate(BaseModel):
    first_name: str
    last_name: str


class UserCreate(UserUpdate):
    email: EmailStr
    username: str
    password: str = Field(..., min_length=8)


class RoleIn(BaseModel):
    name: str

class TierIn(BaseModel):
    tier: int


class ZooIn(BaseModel):
    name: str
    location: str
    information: str | None
