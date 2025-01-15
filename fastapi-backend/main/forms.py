from pydantic import BaseModel
from models import PDF


class PDFForm(BaseModel):
    class Meta:
        model = PDF
        fields = ["title", "pdf"]
