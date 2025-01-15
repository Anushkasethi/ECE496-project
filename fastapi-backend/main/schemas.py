from pydantic import BaseModel
from datetime import datetime


class PDFBase(BaseModel):
    """Defines the common fields for a PDF."""

    title: str
    pdf: str  # Path to the PDF file


class PDFCreate(PDFBase):
    """Model for creating a PDF entry."""

    pass


class PDFSchema(PDFBase):
    """Model for returning PDF metadata."""

    id: int
    uploaded_at: datetime

    class Config:
        orm_mode = True  # Enable ORM support to work seamlessly with SQLAlchemy models
