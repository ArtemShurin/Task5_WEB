from pydantic import BaseModel


class AdminLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminCreate(BaseModel):
    username: str
    password: str


class AdminInfo(BaseModel):
    username: str
