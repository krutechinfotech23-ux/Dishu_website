from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

# Resend import
try:
    import resend
    RESEND_AVAILABLE = True
except ImportError:
    RESEND_AVAILABLE = False

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'dishu-studio-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Resend Config
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'dishuvekariya5@gmail.com')

if RESEND_AVAILABLE and RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# Create the main app
app = FastAPI(title="Dishu Studio API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class BookingCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr
    service_type: str  # "Wedding" or "Baby"
    preferred_date: str
    message: Optional[str] = ""

class Booking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: EmailStr
    service_type: str
    preferred_date: str
    message: Optional[str] = ""
    status: str = "Pending"  # Pending, Confirmed, Cancelled
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BookingUpdate(BaseModel):
    status: str

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminCreate(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    message: str

# ==================== HELPER FUNCTIONS ====================

def create_token(username: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": username,
        "exp": expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def send_booking_emails(booking: Booking):
    """Send notification emails for new booking"""
    if not RESEND_AVAILABLE or not RESEND_API_KEY:
        logger.warning("Resend not configured, skipping email notifications")
        return
    
    try:
        # Email to Admin
        admin_html = f"""
        <div style="font-family: 'Manrope', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #8B6914; font-family: 'Playfair Display', serif;">New Booking Request</h1>
            <div style="background: #FFFBF0; padding: 20px; border-radius: 8px; border-left: 4px solid #F7C52B;">
                <p><strong>Name:</strong> {booking.name}</p>
                <p><strong>Email:</strong> {booking.email}</p>
                <p><strong>Phone:</strong> {booking.phone}</p>
                <p><strong>Service:</strong> {booking.service_type} Photography</p>
                <p><strong>Preferred Date:</strong> {booking.preferred_date}</p>
                <p><strong>Message:</strong> {booking.message or 'No message'}</p>
            </div>
            <p style="color: #666; margin-top: 20px;">- Dishu Studio Booking System</p>
        </div>
        """
        
        admin_params = {
            "from": SENDER_EMAIL,
            "to": [ADMIN_EMAIL],
            "subject": f"New {booking.service_type} Booking - {booking.name}",
            "html": admin_html
        }
        await asyncio.to_thread(resend.Emails.send, admin_params)
        logger.info(f"Admin notification sent for booking {booking.id}")
        
        # Email to User
        user_html = f"""
        <div style="font-family: 'Manrope', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #8B6914; font-family: 'Playfair Display', serif;">Thank You for Your Booking!</h1>
            <p>Dear {booking.name},</p>
            <p>We have received your {booking.service_type} photography booking request. Our team will review your request and get back to you shortly.</p>
            <div style="background: #FFFBF0; padding: 20px; border-radius: 8px; border-left: 4px solid #F7C52B; margin: 20px 0;">
                <h3 style="color: #8B6914; margin-top: 0;">Booking Details</h3>
                <p><strong>Service:</strong> {booking.service_type} Photography</p>
                <p><strong>Preferred Date:</strong> {booking.preferred_date}</p>
                <p><strong>Status:</strong> {booking.status}</p>
            </div>
            <p>If you have any questions, feel free to contact us.</p>
            <p style="margin-top: 30px;">Warm regards,<br><strong>Dishu Studio</strong></p>
            <p style="color: #999; font-size: 12px;">B-12 Gopinath Complex, Lajamani Chowk, Mota Varachha, Surat, Gujarat</p>
        </div>
        """
        
        user_params = {
            "from": SENDER_EMAIL,
            "to": [booking.email],
            "subject": f"Booking Confirmation - Dishu Studio",
            "html": user_html
        }
        await asyncio.to_thread(resend.Emails.send, user_params)
        logger.info(f"User confirmation sent to {booking.email}")
        
    except Exception as e:
        logger.error(f"Failed to send booking emails: {str(e)}")

# ==================== PUBLIC ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Welcome to Dishu Studio API"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "service": "Dishu Studio API"}

# ==================== BOOKING ROUTES ====================

@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate):
    """Create a new booking"""
    booking = Booking(**booking_data.model_dump())
    doc = booking.model_dump()
    await db.bookings.insert_one(doc)
    
    # Send email notifications
    asyncio.create_task(send_booking_emails(booking))
    
    return booking

@api_router.get("/bookings", response_model=List[Booking])
async def get_all_bookings(username: str = Depends(verify_token)):
    """Get all bookings (admin only)"""
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return bookings

@api_router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str, username: str = Depends(verify_token)):
    """Get a specific booking (admin only)"""
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@api_router.patch("/bookings/{booking_id}", response_model=Booking)
async def update_booking_status(booking_id: str, update: BookingUpdate, username: str = Depends(verify_token)):
    """Update booking status (admin only)"""
    result = await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": update.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    return booking

@api_router.delete("/bookings/{booking_id}")
async def delete_booking(booking_id: str, username: str = Depends(verify_token)):
    """Delete a booking (admin only)"""
    result = await db.bookings.delete_one({"id": booking_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking deleted successfully"}

# ==================== CONTACT ROUTE ====================

@api_router.post("/contact")
async def submit_contact(contact: ContactMessage):
    """Submit contact form"""
    doc = {
        "id": str(uuid.uuid4()),
        "name": contact.name,
        "email": contact.email,
        "phone": contact.phone,
        "message": contact.message,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contacts.insert_one(doc)
    
    # Send email to admin
    if RESEND_AVAILABLE and RESEND_API_KEY:
        try:
            html = f"""
            <div style="font-family: 'Manrope', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #8B6914;">New Contact Message</h1>
                <div style="background: #FFFBF0; padding: 20px; border-radius: 8px;">
                    <p><strong>From:</strong> {contact.name}</p>
                    <p><strong>Email:</strong> {contact.email}</p>
                    <p><strong>Phone:</strong> {contact.phone or 'Not provided'}</p>
                    <p><strong>Message:</strong></p>
                    <p style="background: white; padding: 15px; border-radius: 4px;">{contact.message}</p>
                </div>
            </div>
            """
            params = {
                "from": SENDER_EMAIL,
                "to": [ADMIN_EMAIL],
                "subject": f"Contact Message from {contact.name}",
                "html": html
            }
            await asyncio.to_thread(resend.Emails.send, params)
        except Exception as e:
            logger.error(f"Failed to send contact email: {str(e)}")
    
    return {"message": "Thank you for your message. We will get back to you soon!"}

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/login", response_model=TokenResponse)
async def admin_login(credentials: AdminLogin):
    """Admin login"""
    admin = await db.admins.find_one({"username": credentials.username}, {"_id": 0})
    
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(credentials.password.encode(), admin['password'].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(credentials.username)
    return TokenResponse(access_token=token)

@api_router.post("/auth/setup")
async def setup_admin():
    """Create default admin if not exists"""
    existing = await db.admins.find_one({"username": "admin"})
    if existing:
        return {"message": "Admin already exists"}
    
    hashed_password = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
    await db.admins.insert_one({
        "id": str(uuid.uuid4()),
        "username": "admin",
        "password": hashed_password,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"message": "Default admin created", "username": "admin", "password": "admin123"}

@api_router.get("/auth/verify")
async def verify_auth(username: str = Depends(verify_token)):
    """Verify token is valid"""
    return {"valid": True, "username": username}

# ==================== STATS ROUTE ====================

@api_router.get("/stats")
async def get_stats(username: str = Depends(verify_token)):
    """Get booking statistics (admin only)"""
    total = await db.bookings.count_documents({})
    pending = await db.bookings.count_documents({"status": "Pending"})
    confirmed = await db.bookings.count_documents({"status": "Confirmed"})
    cancelled = await db.bookings.count_documents({"status": "Cancelled"})
    wedding = await db.bookings.count_documents({"service_type": "Wedding"})
    baby = await db.bookings.count_documents({"service_type": "Baby"})
    
    return {
        "total": total,
        "pending": pending,
        "confirmed": confirmed,
        "cancelled": cancelled,
        "wedding": wedding,
        "baby": baby
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
