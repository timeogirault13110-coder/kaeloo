from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import bcrypt
import jwt
import httpx
from datetime import datetime, timedelta, timezone
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionRequest, CheckoutStatusResponse,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'change-me')
JWT_ALG = 'HS256'
JWT_EXPIRE_DAYS = int(os.environ.get('JWT_EXPIRE_DAYS', '30'))
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', '')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', '').lower().strip()

app = FastAPI(title="NovaShop API")
api_router = APIRouter(prefix="/api")
auth_scheme = HTTPBearer(auto_error=False)

# ---------------- Product catalog ----------------
PRODUCT_CATALOG: Dict[str, Dict] = {
    'premium-box-supplier': {'title': 'PREMIUM BOX', 'price': 16.33},
    'starter-bundle': {'title': 'STARTER BUNDLE', 'price': 20.43},
    'horse-bundle-supplier': {'title': 'HORSE BUNDLE', 'price': 13.45},
    'starter-box-supplier': {'title': 'STARTER BOX', 'price': 15.16},
    'the-ultimate-fragrance-bundle': {'title': 'STARTER FRAGRANCE BUNDLE', 'price': 19.26},
    'essential-bundle': {'title': 'ESSENTIAL BUNDLE', 'price': 17.50},
    'summer-bundle-supplier': {'title': 'SUMMER BUNDLE', 'price': 18.08},
    'premium-style-guide': {'title': 'PREMIUM STYLE GUIDE', 'price': 9.89},
    'valentine-in-roma': {'title': 'VALENTINE IN ROMA', 'price': 9.94},
    'pods-2-pro-copy': {'title': '2 PRO', 'price': 13.99},
    'rl-sweater': {'title': 'HORSE KNIT SWEATER', 'price': 10.52},
    'phone-16-pro-copy': {'title': 'PHONE 16 PRO', 'price': 15.21},
    'jeans-goltir-fragrance': {'title': 'JEANS GOLTIR FRAGRANCE', 'price': 11.06},
    'goya-cardholder': {'title': 'GOYA CARDHOLDER', 'price': 8.18},
    'milers-tracksuit-supplier': {'title': 'MILERS TRACKSUIT', 'price': 13.99},
    'punk-hoodie': {'title': 'PUNK HOODIE', 'price': 11.69},
    'bb-zip-up': {'title': 'BB ZIP UP', 'price': 11.69},
    'crocodile-bracelet': {'title': 'CROCODILE BRACELET', 'price': 8.18},
    'million': {'title': '! MILLION', 'price': 9.31},
    'aventus-supplier': {'title': 'AVENTUS', 'price': 11.65},
    'dor-b30': {'title': 'B DOR 30', 'price': 11.06},
}

# ---------------- Models ----------------
class RegisterInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: Optional[str] = None

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None
    is_admin: bool = False
    created_at: datetime

class AuthOut(BaseModel):
    token: str
    user: UserOut

class CartLineIn(BaseModel):
    product_id: str
    quantity: int = Field(1, ge=1, le=50)

class CheckoutInput(BaseModel):
    items: List[CartLineIn]
    origin_url: str
    promo_code: Optional[str] = None

class GoogleSessionInput(BaseModel):
    session_id: str

class PromoInput(BaseModel):
    code: str = Field(min_length=2, max_length=32)
    type: str = Field(pattern='^(percent|fixed)$')
    value: float = Field(gt=0)
    max_uses: Optional[int] = Field(None, ge=1)
    expires_at: Optional[datetime] = None
    active: bool = True

class PromoValidateInput(BaseModel):
    code: str
    subtotal: float

# ---------------- Helpers ----------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

def create_token(user_id: str) -> str:
    payload = {
        'sub': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS),
        'iat': datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def is_admin_email(email: str) -> bool:
    return bool(ADMIN_EMAIL) and email.lower().strip() == ADMIN_EMAIL

async def ensure_admin_flag(user: dict) -> dict:
    """Ensure admin flag is set correctly for the configured ADMIN_EMAIL."""
    if is_admin_email(user.get('email', '')) and not user.get('is_admin'):
        await db.users.update_one({'id': user['id']}, {'$set': {'is_admin': True}})
        user['is_admin'] = True
    return user

async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(auth_scheme)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALG])
        user = await db.users.find_one({'id': payload['sub']})
        if user:
            user = await ensure_admin_flag(user)
        return user
    except Exception:
        return None

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(auth_scheme)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({'id': payload['sub']})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return await ensure_admin_flag(user)

async def require_admin(user=Depends(get_current_user)):
    if not user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def user_out(u: dict) -> UserOut:
    return UserOut(
        id=u['id'], email=u['email'], name=u.get('name'), picture=u.get('picture'),
        is_admin=bool(u.get('is_admin')), created_at=u['created_at'],
    )

async def apply_promo(code: str, subtotal: float):
    """Returns (discount, promo_doc) or raises HTTPException."""
    if not code:
        return 0.0, None
    promo = await db.promos.find_one({'code': code.upper().strip()})
    if not promo:
        raise HTTPException(400, "Invalid promo code")
    if not promo.get('active', True):
        raise HTTPException(400, "Promo code is disabled")
    if promo.get('expires_at'):
        exp = promo['expires_at']
        if isinstance(exp, str):
            exp = datetime.fromisoformat(exp)
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < datetime.now(timezone.utc):
            raise HTTPException(400, "Promo code expired")
    if promo.get('max_uses') is not None and promo.get('uses', 0) >= promo['max_uses']:
        raise HTTPException(400, "Promo code fully used")
    if promo['type'] == 'percent':
        discount = round(subtotal * (promo['value'] / 100.0), 2)
    else:
        discount = round(min(promo['value'], subtotal), 2)
    return discount, promo

# ---------------- Routes ----------------
@api_router.get("/")
async def root():
    return {"message": "NovaShop API"}

# --- Auth (email/password) ---
@api_router.post('/auth/register', response_model=AuthOut)
async def register(input: RegisterInput):
    existing = await db.users.find_one({'email': input.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_doc = {
        'id': str(uuid.uuid4()),
        'email': input.email.lower(),
        'name': input.name,
        'password_hash': hash_password(input.password),
        'is_admin': is_admin_email(input.email),
        'created_at': datetime.now(timezone.utc),
    }
    await db.users.insert_one(user_doc)
    return AuthOut(token=create_token(user_doc['id']), user=user_out(user_doc))

@api_router.post('/auth/login', response_model=AuthOut)
async def login(input: LoginInput):
    user = await db.users.find_one({'email': input.email.lower()})
    if not user or not user.get('password_hash') or not verify_password(input.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user = await ensure_admin_flag(user)
    return AuthOut(token=create_token(user['id']), user=user_out(user))

# --- Google Auth (Emergent) ---
@api_router.post('/auth/google/session', response_model=AuthOut)
async def google_session(input: GoogleSessionInput):
    async with httpx.AsyncClient(timeout=10.0) as hc:
        resp = await hc.get(
            'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data',
            headers={'X-Session-ID': input.session_id},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google session")
    data = resp.json()
    email = (data.get('email') or '').lower().strip()
    if not email:
        raise HTTPException(status_code=400, detail="No email from Google")

    user = await db.users.find_one({'email': email})
    if not user:
        user = {
            'id': str(uuid.uuid4()),
            'email': email,
            'name': data.get('name'),
            'picture': data.get('picture'),
            'is_admin': is_admin_email(email),
            'created_at': datetime.now(timezone.utc),
        }
        await db.users.insert_one(user)
    else:
        updates = {}
        if data.get('name') and data.get('name') != user.get('name'):
            updates['name'] = data['name']
        if data.get('picture') and data.get('picture') != user.get('picture'):
            updates['picture'] = data['picture']
        if is_admin_email(email) and not user.get('is_admin'):
            updates['is_admin'] = True
        if updates:
            await db.users.update_one({'id': user['id']}, {'$set': updates})
            user.update(updates)

    return AuthOut(token=create_token(user['id']), user=user_out(user))

@api_router.get('/auth/me', response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return user_out(user)

# --- Library ---
@api_router.get('/library')
async def library(user=Depends(get_current_user)):
    orders = await db.orders.find({'user_id': user['id'], 'status': 'paid'}).sort('created_at', -1).to_list(100)
    items = []
    for o in orders:
        for line in o.get('items', []):
            info = PRODUCT_CATALOG.get(line['product_id'], {})
            items.append({
                'product_id': line['product_id'],
                'title': info.get('title', line['product_id']),
                'ordered_at': o['created_at'],
                'order_id': o['id'],
            })
    return {'items': items}

# --- Promo validation (public) ---
@api_router.post('/promos/validate')
async def validate_promo(input: PromoValidateInput):
    discount, promo = await apply_promo(input.code, input.subtotal)
    return {
        'valid': True,
        'code': promo['code'],
        'type': promo['type'],
        'value': promo['value'],
        'discount': discount,
    }

# --- Stripe Checkout ---
@api_router.post('/payments/checkout')
async def create_checkout(input: CheckoutInput, request: Request, user=Depends(get_current_user_optional)):
    if not input.items:
        raise HTTPException(400, "Cart is empty")
    if not STRIPE_API_KEY:
        raise HTTPException(500, "Stripe not configured")

    subtotal = 0.0
    line_desc = []
    for line in input.items:
        p = PRODUCT_CATALOG.get(line.product_id)
        if not p:
            raise HTTPException(400, f"Unknown product: {line.product_id}")
        subtotal += p['price'] * line.quantity
        line_desc.append(f"{p['title']} x{line.quantity}")
    subtotal = round(subtotal, 2)

    discount = 0.0
    promo_doc = None
    if input.promo_code:
        discount, promo_doc = await apply_promo(input.promo_code, subtotal)

    total = round(max(subtotal - discount, 0.5), 2)  # Stripe minimum

    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    origin = input.origin_url.rstrip('/')
    success_url = f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/payment/cancel"

    req = CheckoutSessionRequest(
        amount=float(total),
        currency='usd',
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            'user_id': (user or {}).get('id', 'guest'),
            'email': (user or {}).get('email', ''),
            'items': '|'.join(line_desc)[:490],
            'promo': (promo_doc or {}).get('code', ''),
        },
    )
    session = await checkout.create_checkout_session(req)

    order_doc = {
        'id': str(uuid.uuid4()),
        'user_id': (user or {}).get('id'),
        'email': (user or {}).get('email'),
        'items': [line.dict() for line in input.items],
        'subtotal': float(subtotal),
        'discount': float(discount),
        'amount': float(total),
        'currency': 'usd',
        'promo_code': (promo_doc or {}).get('code'),
        'status': 'initiated',
        'payment_status': 'pending',
        'session_id': session.session_id,
        'created_at': datetime.now(timezone.utc),
        'updated_at': datetime.now(timezone.utc),
    }
    await db.orders.insert_one(order_doc)

    return {'checkout_url': session.url, 'session_id': session.session_id, 'amount': total, 'discount': discount, 'subtotal': subtotal}

@api_router.get('/payments/status/{session_id}')
async def get_status(session_id: str):
    order = await db.orders.find_one({'session_id': session_id})
    if not order:
        raise HTTPException(404, "Order not found")
    if order.get('payment_status') != 'paid':
        try:
            checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url='https://example.com/api/webhook/stripe')
            status_resp: CheckoutStatusResponse = await checkout.get_checkout_status(session_id)
            if status_resp.payment_status == 'paid' or status_resp.status == 'complete':
                await db.orders.update_one(
                    {'session_id': session_id, 'payment_status': {'$ne': 'paid'}},
                    {'$set': {'status': 'paid', 'payment_status': 'paid', 'updated_at': datetime.now(timezone.utc)}}
                )
                # Increment promo usage on success
                if order.get('promo_code'):
                    await db.promos.update_one({'code': order['promo_code']}, {'$inc': {'uses': 1}})
                order = await db.orders.find_one({'session_id': session_id})
        except Exception as e:
            logging.warning(f"Stripe status poll failed: {e}")
    return {
        'session_id': order['session_id'],
        'status': order['status'],
        'payment_status': order['payment_status'],
        'amount': order['amount'],
    }

@api_router.post('/webhook/stripe')
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get('Stripe-Signature', '')
    try:
        checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url='https://example.com/api/webhook/stripe')
        result = await checkout.handle_webhook(body, signature)
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        raise HTTPException(400, "Invalid webhook")
    session_id = result.session_id
    if result.payment_status == 'paid':
        order = await db.orders.find_one({'session_id': session_id})
        was_unpaid = order and order.get('payment_status') != 'paid'
        await db.orders.update_one(
            {'session_id': session_id, 'payment_status': {'$ne': 'paid'}},
            {'$set': {'status': 'paid', 'payment_status': 'paid', 'updated_at': datetime.now(timezone.utc)}}
        )
        if was_unpaid and order and order.get('promo_code'):
            await db.promos.update_one({'code': order['promo_code']}, {'$inc': {'uses': 1}})
    return {'ok': True}

# --- Admin: Promos ---
@api_router.get('/admin/promos')
async def admin_list_promos(admin=Depends(require_admin)):
    docs = await db.promos.find({}, {'_id': 0}).sort('created_at', -1).to_list(500)
    return {'items': docs}

@api_router.post('/admin/promos')
async def admin_create_promo(input: PromoInput, admin=Depends(require_admin)):
    code = input.code.upper().strip()
    existing = await db.promos.find_one({'code': code})
    if existing:
        raise HTTPException(400, "Promo code already exists")
    if input.type == 'percent' and input.value > 100:
        raise HTTPException(400, "Percent must be <= 100")
    doc = {
        'id': str(uuid.uuid4()),
        'code': code,
        'type': input.type,
        'value': float(input.value),
        'max_uses': input.max_uses,
        'uses': 0,
        'expires_at': input.expires_at,
        'active': input.active,
        'created_at': datetime.now(timezone.utc),
    }
    await db.promos.insert_one(doc)
    doc.pop('_id', None)
    return doc

@api_router.delete('/admin/promos/{code}')
async def admin_delete_promo(code: str, admin=Depends(require_admin)):
    res = await db.promos.delete_one({'code': code.upper().strip()})
    if res.deleted_count == 0:
        raise HTTPException(404, "Promo not found")
    return {'ok': True}

@api_router.patch('/admin/promos/{code}/toggle')
async def admin_toggle_promo(code: str, admin=Depends(require_admin)):
    promo = await db.promos.find_one({'code': code.upper().strip()})
    if not promo:
        raise HTTPException(404, "Promo not found")
    await db.promos.update_one({'code': promo['code']}, {'$set': {'active': not promo.get('active', True)}})
    return {'ok': True, 'active': not promo.get('active', True)}

# --- Admin: Orders ---
@api_router.get('/admin/orders')
async def admin_list_orders(admin=Depends(require_admin), limit: int = 200):
    docs = await db.orders.find({}, {'_id': 0}).sort('created_at', -1).to_list(limit)
    return {'items': docs}

# --- Admin: Users ---
@api_router.get('/admin/users')
async def admin_list_users(admin=Depends(require_admin)):
    docs = await db.users.find({}, {'_id': 0, 'password_hash': 0}).sort('created_at', -1).to_list(500)
    return {'items': docs}

@api_router.post('/admin/users/{user_id}/promote')
async def admin_promote(user_id: str, admin=Depends(require_admin)):
    res = await db.users.update_one({'id': user_id}, {'$set': {'is_admin': True}})
    if res.matched_count == 0:
        raise HTTPException(404, "User not found")
    return {'ok': True}

@api_router.post('/admin/users/{user_id}/demote')
async def admin_demote(user_id: str, admin=Depends(require_admin)):
    target = await db.users.find_one({'id': user_id})
    if not target:
        raise HTTPException(404, "User not found")
    if is_admin_email(target.get('email', '')):
        raise HTTPException(400, "Cannot demote the primary admin")
    await db.users.update_one({'id': user_id}, {'$set': {'is_admin': False}})
    return {'ok': True}

# --- Admin: Stats ---
@api_router.get('/admin/stats')
async def admin_stats(admin=Depends(require_admin)):
    total_users = await db.users.count_documents({})
    total_orders = await db.orders.count_documents({})
    paid_orders = await db.orders.count_documents({'status': 'paid'})
    pipeline = [
        {'$match': {'status': 'paid'}},
        {'$group': {'_id': None, 'total': {'$sum': '$amount'}, 'count': {'$sum': 1}}},
    ]
    rev = await db.orders.aggregate(pipeline).to_list(1)
    revenue = rev[0]['total'] if rev else 0.0
    aov = (revenue / rev[0]['count']) if rev and rev[0]['count'] else 0.0

    # Top products
    pipeline_products = [
        {'$match': {'status': 'paid'}},
        {'$unwind': '$items'},
        {'$group': {'_id': '$items.product_id', 'qty': {'$sum': '$items.quantity'}}},
        {'$sort': {'qty': -1}},
        {'$limit': 5},
    ]
    top_raw = await db.orders.aggregate(pipeline_products).to_list(5)
    top_products = [
        {'product_id': t['_id'], 'title': PRODUCT_CATALOG.get(t['_id'], {}).get('title', t['_id']), 'qty': t['qty']}
        for t in top_raw
    ]
    return {
        'total_users': total_users,
        'total_orders': total_orders,
        'paid_orders': paid_orders,
        'revenue': round(revenue, 2),
        'avg_order_value': round(aov, 2),
        'top_products': top_products,
    }

# ---------------- Wire it up ----------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event('shutdown')
async def shutdown_db_client():
    client.close()
