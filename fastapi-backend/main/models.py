from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from database import Base


class PDF(Base):
    __tablename__ = "pdfs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)  # Title of the PDF
    pdf = Column(String, nullable=False)  # File path
    uploaded_at = Column(DateTime, default=datetime.utcnow)  # Timestamp

    def __repr__(self):
        return f"<PDF(id={self.id}, title='{self.title}', pdf='{self.pdf}', uploaded_at={self.uploaded_at})>"

    # uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
