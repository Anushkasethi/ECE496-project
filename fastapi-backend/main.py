# import os
# import json
# import pickle
# import pyrebase
# import torch
# import pyrebase
# import torch
# import uuid
# from fastapi import Depends, FastAPI, HTTPException, UploadFile, Form, Request, status
# from fastapi.templating import Jinja2Templates
# from fastapi.responses import HTMLResponse
# from firebase_admin import auth, credentials, initialize_app, firestore, storage
# from pydantic import BaseModel
# from datetime import datetime, timedelta
# from database import SessionLocal, engine, Base, get_db
# from models import PDF, CalendarEvent
# from utils import extract_tasks, write_files, extract_tasks_from_file, classify_tasks
# from fastapi.middleware.cors import CORSMiddleware
# # from classify import ModelPipeline
# from sqlalchemy.orm import Session
# from typing import List
# from schemas import CalendarEventCreate, CalendarEvent as CalendarEventSchema

# # Initialize FastAPI app
# app = FastAPI()
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Can be a list of allowed origins
#     allow_credentials=True,
#     allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
#     allow_headers=["*"],  # Allows all headers
# )
# # Set up Jinja2 templates
# templates = Jinja2Templates(directory="templates")

# # Initialize Firebase Admin SDK if not already initialized
# cred = credentials.Certificate(
#     "projectpath-827df-firebase-adminsdk-uit6p-15246742b0.json"
# )
# firebase_app = initialize_app(
#     cred, {"storageBucket": "projectpath-827df.firebasestorage.app"}
# )
# firestoreDatabase = firestore.client()
# bucket = storage.bucket()  # Reference to Firebase Storage

# # Authentication set up
# with open("config.json") as config_file:
#     firebaseConfig = json.load(config_file)
# pyre = pyrebase.initialize_app(firebaseConfig)

# pyreAuth = pyre.auth()
# authDB = pyre.database()

# # Define media root and directories
# MEDIA_ROOT = "media"
# PDF_UPLOAD_DIR = os.path.join(MEDIA_ROOT, "pdfs")
# PARSED_PDF_DIR = os.path.join(MEDIA_ROOT, "parsed_pdfs")
# EXTRACTED_TASKS_DIR = os.path.join(MEDIA_ROOT, "extracted_tasks")

# # Ensure directories exist
# os.makedirs(PDF_UPLOAD_DIR, exist_ok=True)
# os.makedirs(PARSED_PDF_DIR, exist_ok=True)
# os.makedirs(EXTRACTED_TASKS_DIR, exist_ok=True)

# # Initialize database
# Base.metadata.create_all(bind=engine)


# # Pydantic schema for PDF data
# class PDFSchema(BaseModel):
#     title: str
#     file_path: str


# @app.get("/", response_class=HTMLResponse)
# async def upload_form(request: Request):
#     return templates.TemplateResponse("upload_pdf.html", {"request": request})


# @app.post("/login")
# async def login_user(email: str = Form(...), password: str = Form(...)):
#     try:
#         # Attempt to sign in with provided email and password
#         user = pyreAuth.sign_in_with_email_and_password(email, password)
#         id_token = user["idToken"]  # Retrieve the ID token assigned by Firebase
#         # emailVerified = False
#         # try:
#         #     emailVerified = auth.get_user(user["localId"]).email_verified
#         # except Exception as e:
#         #     emailVerified = user["email_verified"]
#         return {
#             "message": "Login successful",
#             "user_id": user["localId"],
#             "id_token": id_token,
#             # "email_verified": emailVerified,
#         }
#     except Exception as e:
#         # Log the error and raise a 401 Unauthorized exception
#         print("Login error:", e)
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
#         )


# @app.post("/signup")
# async def signup(email: str = Form(...), password: str = Form(...)):
#     if not email.endswith("utoronto.ca"):
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Email must be a utoronto.ca email",
#         )

#     try:
#         # Create a new user with the provided email and password
#         user = pyreAuth.create_user_with_email_and_password(email, password)
#         user_id = user["localId"]  # Retrieve the unique ID assigned by Firebase
#         id_token = user["idToken"]  # Retrieve the ID token assigned by Firebase

#         # Attempt to store additional user data in the Realtime Database
#         try:
#             authDB.child("users").child(user_id).set(
#                 {"email": email, "password": password}
#             )
#         except Exception as db_error:
#             # Check if the error is due to a 404 Not Found error
#             if "Not Found for url" in str(db_error):
#                 print("Warning: url not found error raised, but signup was successful")
#                 try:
#                     pyreAuth.send_email_verification(user["idToken"])
#                 except Exception as e:
#                     print("Error sending email verification:", e)
#             else:
#                 # If it's another type of error, raise it
#                 print("Error saving user data to database:", db_error)
#                 raise HTTPException(
#                     status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#                     detail="Error saving user data to database",
#                 )

#         # Return success message if signup (and optional database write) succeed
#         return {
#             "message": "User created successfully",
#             "user_id": user_id,
#             "id_token": id_token,
#         }

#     except Exception as e:
#         # Catch and print signup errors, raise a 400 Bad Request exception with error details
#         print("Signup error:", e)
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# class IdToken(BaseModel):
#     id_token: str  # id_token of the user whose profile is being updated


# def classify(output_filepath):
#     loaded_model = pickle.load(open("trained_model.pkl", "rb"))
#     device = torch.device("cpu")
#     loaded_model = loaded_model.to(device)
#     loaded_model.eval()
#     tasks = extract_tasks_from_file(file_path=output_filepath)
#     classified_tasks = classify_tasks(r"Dataset - Sheet1.csv", tasks, loaded_model)

#     output = {}
#     for val, task in enumerate(tasks):
#         output[task] = classified_tasks[val]

#     return output


# @app.post("/upload/")
# async def upload_pdf(title: str = Form(...), pdf: UploadFile = UploadFile(...)):
#     input_dir = os.path.join(MEDIA_ROOT, "pdfs")
#     os.makedirs(input_dir, exist_ok=True)
#     input_file_path = os.path.join(PDF_UPLOAD_DIR, pdf.filename)

#     with open(input_file_path, "wb") as f:
#         f.write(await pdf.read())

#     output_dir = os.path.join(MEDIA_ROOT, "parsed_pdfs")
#     os.makedirs(output_dir, exist_ok=True)

#     # Extract the course name
#     _, file_name = os.path.split(pdf.filename)
#     course_name, _ = os.path.splitext(file_name)

#     # Call the write_files function
#     write_files(input_dir, output_dir)
#     extracted_tasks_output_dir = os.path.join(MEDIA_ROOT, "extracted_tasks")
#     extract_tasks(output_dir, extracted_tasks_output_dir, course_name + ".txt")

#     output_filepath = os.path.join(
#         extracted_tasks_output_dir, f"{course_name}_results.txt"
#     )
#     classified_tasks = classify(output_filepath)

#     # Upload the file to Firebase Storage
#     time = datetime.utcnow()
#     filename = f"{uuid.uuid4()}.pdf"
#     blob = bucket.blob(filename)
#     blob.upload_from_filename(input_file_path)

#     new_entry = {
#         "courseName": course_name,
#         "classifiedTasks": classified_tasks,
#         "time": time,
#         "pdfFile": blob.generate_signed_url(timedelta(days=365)),
#     }

#     firestoreDatabase.collection("syllabi").add(new_entry)

#     # Redirect to the list view
#     return {"classified_tasks": classified_tasks}

# @app.post("/calendar/events/", response_model=CalendarEventSchema)
# def create_event(event: CalendarEventCreate, db: Session = Depends(get_db)):
#     db_event = CalendarEvent(**event.dict())
#     db.add(db_event)
#     db.commit()
#     db.refresh(db_event)
#     return db_event

# @app.get("/calendar/events/{user_id}", response_model=List[CalendarEventSchema])
# def read_events(user_id: str, db: Session = Depends(get_db)):
#     events = db.query(CalendarEvent).filter(CalendarEvent.user_id == user_id).all()
#     return events

# @app.put("/calendar/events/{event_id}", response_model=CalendarEventSchema)
# def update_event(event_id: int, event: CalendarEventCreate, db: Session = Depends(get_db)):
#     db_event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
#     if db_event is None:
#         raise HTTPException(status_code=404, detail="Event not found")
#     for key, value in event.dict().items():
#         setattr(db_event, key, value)
#     db.commit()
#     db.refresh(db_event)
#     return db_event

# @app.delete("/calendar/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_event(event_id: int, db: Session = Depends(get_db)):
#     db_event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
#     if db_event is None:
#         raise HTTPException(status_code=404, detail="Event not found")
#     db.delete(db_event)
#     db.commit()
#     return {"ok": True}
import os
import json
import pickle
import uuid
import torch
from fastapi import Depends, FastAPI, HTTPException, UploadFile, Form, Request, status, Response, File
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from firebase_admin import auth, credentials, initialize_app, firestore, storage
from pydantic import BaseModel
from datetime import datetime, timedelta
from database import SessionLocal, engine, Base, get_db
from models import PDF, CalendarEvent
from utils import extract_tasks, write_files, extract_tasks_from_file, classify_tasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from schemas import CalendarEventCreate, CalendarEvent as CalendarEventSchema
from ics import Calendar
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# app = Flask(__name__)
# TEMP_USER_ID = "jPxNqTcoqbhEbPVOTJ5TIPprp3e2"
# Initialize FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Can be a list of allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)
# Set up Jinja2 templates
templates = Jinja2Templates(directory="templates")

# Initialize Firebase Admin SDK
cred = credentials.Certificate(
    "projectpath-827df-firebase-adminsdk-uit6p-15246742b0.json"
)
firebase_app = initialize_app(
    cred, {"storageBucket": "projectpath-827df.firebasestorage.app"}
)
firestoreDatabase = firestore.client()
bucket = storage.bucket()  # Reference to Firebase Storage

# Define media root and directories
MEDIA_ROOT = "media"
PDF_UPLOAD_DIR = os.path.join(MEDIA_ROOT, "pdfs")
PARSED_PDF_DIR = os.path.join(MEDIA_ROOT, "parsed_pdfs")
EXTRACTED_TASKS_DIR = os.path.join(MEDIA_ROOT, "extracted_tasks")

# Ensure directories exist
os.makedirs(PDF_UPLOAD_DIR, exist_ok=True)
os.makedirs(PARSED_PDF_DIR, exist_ok=True)
os.makedirs(EXTRACTED_TASKS_DIR, exist_ok=True)

# Initialize database
Base.metadata.create_all(bind=engine)

# Pydantic schema for PDF data
class PDFSchema(BaseModel):
    title: str
    file_path: str

@app.get("/", response_class=HTMLResponse)
async def upload_form(request: Request):
    return templates.TemplateResponse("upload_pdf.html", {"request": request})

@app.post("/parse/")
async def parse_ics(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        c = Calendar(contents.decode("utf-8"))

        events = [
            {
                "summary": event.name,  # Course code
                "start": event.begin.format("YYYY-MM-DD HH:mm"),  # Start time
                "end": event.end.format("YYYY-MM-DD HH:mm"),  # End time
            }
            for event in c.events
        ]

        return {"events": events}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.post("/login")
async def login_user(response: Response, email: str = Form(...), password: str = Form(...)):
    try:
        # user = auth.get_user_by_email(email)
        print(response)
        return {
            "message": "Login successful",
            # "user_id": user.uid,
        }
    except Exception as e:
        print("Login error:", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

@app.post("/signup")
async def signup(email: str = Form(...), password: str = Form(...)):
    if not email.endswith("utoronto.ca"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email must be a utoronto.ca email",
        )
    try:
        user = auth.create_user(email=email, password=password)
        return {
            "message": "User created successfully",
            "user_id": user.uid,
        }
    except Exception as e:
        print("Signup error:", e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

def classify(output_filepath):
    loaded_model = pickle.load(open("trained_model.pkl", "rb"))
    device = torch.device("cpu")
    loaded_model = loaded_model.to(device)
    loaded_model.eval()
    tasks = extract_tasks_from_file(file_path=output_filepath)
    classified_tasks = classify_tasks(r"Dataset - Sheet1.csv", tasks, loaded_model)

    output = {}
    for val, task in enumerate(tasks):
        output[task] = classified_tasks[val]

    return output

@app.post("/upload/")
async def upload_pdf(title: str = Form(...), pdf: UploadFile = UploadFile(...)):
    input_dir = os.path.join(MEDIA_ROOT, "pdfs")
    os.makedirs(input_dir, exist_ok=True)
    input_file_path = os.path.join(PDF_UPLOAD_DIR, pdf.filename)

    with open(input_file_path, "wb") as f:
        f.write(await pdf.read())

    output_dir = os.path.join(MEDIA_ROOT, "parsed_pdfs")
    os.makedirs(output_dir, exist_ok=True)
    
    _, file_name = os.path.split(pdf.filename)
    course_name, _ = os.path.splitext(file_name)

    write_files(input_dir, output_dir)
    extracted_tasks_output_dir = os.path.join(MEDIA_ROOT, "extracted_tasks")
    extract_tasks(output_dir, extracted_tasks_output_dir, course_name + ".txt")

    output_filepath = os.path.join(
        extracted_tasks_output_dir, f"{course_name}_results.txt"
    )
    classified_tasks = classify(output_filepath)

    # Upload the file to Firebase Storage
    time = datetime.utcnow()
    filename = f"{uuid.uuid4()}.pdf"
    blob = bucket.blob(filename)
    blob.upload_from_filename(input_file_path)

    new_entry = {
        "courseName": course_name,
        "classifiedTasks": classified_tasks,
        "time": time,
        "pdfFile": blob.generate_signed_url(timedelta(days=365)),
    }

    firestoreDatabase.collection("syllabi").add(new_entry)
    
    return {"classified_tasks": classified_tasks}

@app.post("/calendar/events/", response_model=CalendarEventSchema)
def create_event(event: CalendarEventCreate, db: Session = Depends(get_db)):
    db_event = CalendarEvent(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.get("/calendar/events/{user_id}", response_model=List[CalendarEventSchema])
def read_events(user_id: str, db: Session = Depends(get_db)):
    events = db.query(CalendarEvent).filter(CalendarEvent.user_id == user_id).all()
    return events

@app.put("/calendar/events/{event_id}", response_model=CalendarEventSchema)
def update_event(event_id: int, event: CalendarEventCreate, db: Session = Depends(get_db)):
    db_event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    for key, value in event.dict().items():
        setattr(db_event, key, value)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.delete("/calendar/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(db_event)
    db.commit()
    return {"ok": True}
