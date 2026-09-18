#!/usr/bin/env python3
"""
NovaShop Backend API Test Suite
Tests all backend endpoints with real API calls
"""
import requests
import uuid
import sys
from typing import Dict, Optional

# Base URL from frontend/.env
BASE_URL = "https://novashop-reseller.preview.emergentagent.com/api"

class TestResults:
    def __init__(self):
        self.passed = []
        self.failed = []
        self.warnings = []
    
    def add_pass(self, test_name: str, details: str = ""):
        self.passed.append(f"✅ {test_name}" + (f": {details}" if details else ""))
    
    def add_fail(self, test_name: str, details: str):
        self.failed.append(f"❌ {test_name}: {details}")
    
    def add_warning(self, test_name: str, details: str):
        self.warnings.append(f"⚠️  {test_name}: {details}")
    
    def print_summary(self):
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        
        if self.failed:
            print("\n🔴 FAILED TESTS:")
            for fail in self.failed:
                print(f"  {fail}")
        
        if self.warnings:
            print("\n🟡 WARNINGS:")
            for warn in self.warnings:
                print(f"  {warn}")
        
        if self.passed:
            print("\n🟢 PASSED TESTS:")
            for pass_test in self.passed:
                print(f"  {pass_test}")
        
        print("\n" + "="*80)
        print(f"Total: {len(self.passed)} passed, {len(self.failed)} failed, {len(self.warnings)} warnings")
        print("="*80)
        
        return len(self.failed) == 0

results = TestResults()

def test_root_health_check():
    """Test GET /api/ endpoint"""
    print("\n[TEST] Root health check")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "NovaShop API":
                results.add_pass("Root health check", f"Response: {data}")
                return True
            else:
                results.add_fail("Root health check", f"Unexpected response: {data}")
                return False
        else:
            results.add_fail("Root health check", f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        results.add_fail("Root health check", f"Exception: {str(e)}")
        return False

def test_auth_register(email: str, password: str, name: str) -> Optional[Dict]:
    """Test POST /api/auth/register"""
    print(f"\n[TEST] Auth register with email: {email}")
    try:
        payload = {
            "email": email,
            "password": password,
            "name": name
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                user = data["user"]
                if user.get("email") == email.lower() and user.get("name") == name and "id" in user and "created_at" in user:
                    results.add_pass("Auth register", f"User created: {user['id']}")
                    return data
                else:
                    results.add_fail("Auth register", f"Invalid user data: {user}")
                    return None
            else:
                results.add_fail("Auth register", f"Missing token or user in response: {data}")
                return None
        else:
            results.add_fail("Auth register", f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        results.add_fail("Auth register", f"Exception: {str(e)}")
        return None

def test_auth_register_duplicate(email: str, password: str, name: str):
    """Test POST /api/auth/register with duplicate email"""
    print(f"\n[TEST] Auth register duplicate email: {email}")
    try:
        payload = {
            "email": email,
            "password": password,
            "name": name
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        
        if response.status_code == 400:
            data = response.json()
            if "Email already registered" in data.get("detail", ""):
                results.add_pass("Auth register duplicate", "Correctly rejected duplicate email")
                return True
            else:
                results.add_fail("Auth register duplicate", f"Wrong error message: {data}")
                return False
        else:
            results.add_fail("Auth register duplicate", f"Expected 400, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        results.add_fail("Auth register duplicate", f"Exception: {str(e)}")
        return False

def test_auth_login(email: str, password: str) -> Optional[Dict]:
    """Test POST /api/auth/login"""
    print(f"\n[TEST] Auth login with email: {email}")
    try:
        payload = {
            "email": email,
            "password": password
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                user = data["user"]
                if user.get("email") == email.lower():
                    results.add_pass("Auth login", f"Login successful for user: {user['id']}")
                    return data
                else:
                    results.add_fail("Auth login", f"Email mismatch: {user}")
                    return None
            else:
                results.add_fail("Auth login", f"Missing token or user in response: {data}")
                return None
        else:
            results.add_fail("Auth login", f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        results.add_fail("Auth login", f"Exception: {str(e)}")
        return None

def test_auth_login_wrong_password(email: str):
    """Test POST /api/auth/login with wrong password"""
    print(f"\n[TEST] Auth login with wrong password: {email}")
    try:
        payload = {
            "email": email,
            "password": "wrongpassword123"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        
        if response.status_code == 401:
            data = response.json()
            if "Invalid credentials" in data.get("detail", ""):
                results.add_pass("Auth login wrong password", "Correctly rejected wrong password")
                return True
            else:
                results.add_fail("Auth login wrong password", f"Wrong error message: {data}")
                return False
        else:
            results.add_fail("Auth login wrong password", f"Expected 401, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        results.add_fail("Auth login wrong password", f"Exception: {str(e)}")
        return False

def test_auth_me(token: str) -> bool:
    """Test GET /api/auth/me with token"""
    print(f"\n[TEST] Auth /me with token")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "email" in data and "created_at" in data:
                results.add_pass("Auth /me with token", f"User data retrieved: {data['email']}")
                return True
            else:
                results.add_fail("Auth /me with token", f"Invalid user data: {data}")
                return False
        else:
            results.add_fail("Auth /me with token", f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        results.add_fail("Auth /me with token", f"Exception: {str(e)}")
        return False

def test_auth_me_no_token():
    """Test GET /api/auth/me without token"""
    print(f"\n[TEST] Auth /me without token")
    try:
        response = requests.get(f"{BASE_URL}/auth/me", timeout=10)
        
        if response.status_code == 401:
            results.add_pass("Auth /me without token", "Correctly rejected request without token")
            return True
        else:
            results.add_fail("Auth /me without token", f"Expected 401, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        results.add_fail("Auth /me without token", f"Exception: {str(e)}")
        return False

def test_library_no_token():
    """Test GET /api/library without token"""
    print(f"\n[TEST] Library without token")
    try:
        response = requests.get(f"{BASE_URL}/library", timeout=10)
        
        if response.status_code == 401:
            results.add_pass("Library without token", "Correctly rejected request without token")
            return True
        else:
            results.add_fail("Library without token", f"Expected 401, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        results.add_fail("Library without token", f"Exception: {str(e)}")
        return False

def test_library_with_token(token: str):
    """Test GET /api/library with token (should be empty for new user)"""
    print(f"\n[TEST] Library with token (new user)")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/library", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "items" in data:
                if len(data["items"]) == 0:
                    results.add_pass("Library with token", "Empty library for new user")
                    return True
                else:
                    results.add_warning("Library with token", f"Expected empty library, got {len(data['items'])} items")
                    return True
            else:
                results.add_fail("Library with token", f"Missing 'items' key in response: {data}")
                return False
        else:
            results.add_fail("Library with token", f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        results.add_fail("Library with token", f"Exception: {str(e)}")
        return False

def test_checkout_valid(token: str) -> Optional[Dict]:
    """Test POST /api/payments/checkout with valid cart"""
    print(f"\n[TEST] Stripe checkout with valid cart")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "items": [
                {"product_id": "premium-box-supplier", "quantity": 1}
            ],
            "origin_url": "https://novashop-reseller.preview.emergentagent.com"
        }
        response = requests.post(f"{BASE_URL}/payments/checkout", json=payload, headers=headers, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if "checkout_url" in data and "session_id" in data:
                if data["checkout_url"].startswith("https://checkout.stripe.com") or data["checkout_url"].startswith("https://"):
                    results.add_pass("Stripe checkout valid", f"Session created: {data['session_id'][:20]}...")
                    results.add_warning("Stripe checkout", "⚠️  LIVE MODE - DO NOT complete payment on checkout_url")
                    return data
                else:
                    results.add_fail("Stripe checkout valid", f"Invalid checkout_url: {data['checkout_url']}")
                    return None
            else:
                results.add_fail("Stripe checkout valid", f"Missing checkout_url or session_id: {data}")
                return None
        else:
            results.add_fail("Stripe checkout valid", f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        results.add_fail("Stripe checkout valid", f"Exception: {str(e)}")
        return None

def test_checkout_unknown_product(token: str):
    """Test POST /api/payments/checkout with unknown product"""
    print(f"\n[TEST] Stripe checkout with unknown product")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "items": [
                {"product_id": "nonexistent-product-xyz", "quantity": 1}
            ],
            "origin_url": "https://novashop-reseller.preview.emergentagent.com"
        }
        response = requests.post(f"{BASE_URL}/payments/checkout", json=payload, headers=headers, timeout=10)
        
        if response.status_code == 400:
            data = response.json()
            if "Unknown product" in data.get("detail", ""):
                results.add_pass("Stripe checkout unknown product", "Correctly rejected unknown product")
                return True
            else:
                results.add_fail("Stripe checkout unknown product", f"Wrong error message: {data}")
                return False
        else:
            results.add_fail("Stripe checkout unknown product", f"Expected 400, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        results.add_fail("Stripe checkout unknown product", f"Exception: {str(e)}")
        return False

def test_checkout_empty_cart(token: str):
    """Test POST /api/payments/checkout with empty cart"""
    print(f"\n[TEST] Stripe checkout with empty cart")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "items": [],
            "origin_url": "https://novashop-reseller.preview.emergentagent.com"
        }
        response = requests.post(f"{BASE_URL}/payments/checkout", json=payload, headers=headers, timeout=10)
        
        if response.status_code == 400:
            data = response.json()
            if "Cart is empty" in data.get("detail", ""):
                results.add_pass("Stripe checkout empty cart", "Correctly rejected empty cart")
                return True
            else:
                results.add_fail("Stripe checkout empty cart", f"Wrong error message: {data}")
                return False
        else:
            results.add_fail("Stripe checkout empty cart", f"Expected 400, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        results.add_fail("Stripe checkout empty cart", f"Exception: {str(e)}")
        return False

def test_payment_status(session_id: str):
    """Test GET /api/payments/status/{session_id}"""
    print(f"\n[TEST] Payment status for session: {session_id[:20]}...")
    try:
        response = requests.get(f"{BASE_URL}/payments/status/{session_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "session_id" in data and "status" in data and "payment_status" in data and "amount" in data:
                if data["status"] == "initiated" and data["payment_status"] == "pending" and data["amount"] == 16.33:
                    results.add_pass("Payment status", f"Order found: status={data['status']}, payment_status={data['payment_status']}, amount={data['amount']}")
                    return True
                else:
                    results.add_fail("Payment status", f"Unexpected values: {data}")
                    return False
            else:
                results.add_fail("Payment status", f"Missing required fields: {data}")
                return False
        else:
            results.add_fail("Payment status", f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        results.add_fail("Payment status", f"Exception: {str(e)}")
        return False

def test_payment_status_nonexistent():
    """Test GET /api/payments/status/{session_id} with nonexistent session"""
    print(f"\n[TEST] Payment status for nonexistent session")
    try:
        response = requests.get(f"{BASE_URL}/payments/status/nonexistent-session-xyz", timeout=10)
        
        if response.status_code == 404:
            data = response.json()
            if "Order not found" in data.get("detail", ""):
                results.add_pass("Payment status nonexistent", "Correctly returned 404 for nonexistent session")
                return True
            else:
                results.add_fail("Payment status nonexistent", f"Wrong error message: {data}")
                return False
        else:
            results.add_fail("Payment status nonexistent", f"Expected 404, got {response.status_code}: {response.text}")
            return False
    except Exception as e:
        results.add_fail("Payment status nonexistent", f"Exception: {str(e)}")
        return False

def main():
    print("="*80)
    print("NovaShop Backend API Test Suite")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print("="*80)
    
    # Generate unique test credentials
    test_uuid = str(uuid.uuid4())[:8]
    test_email = f"test_{test_uuid}@example.com"
    test_password = "test1234"
    test_name = "Test User"
    
    print(f"\nTest credentials:")
    print(f"  Email: {test_email}")
    print(f"  Password: {test_password}")
    print(f"  Name: {test_name}")
    
    # 1. Root health check
    test_root_health_check()
    
    # 2. Auth flow
    auth_data = test_auth_register(test_email, test_password, test_name)
    if not auth_data:
        print("\n❌ CRITICAL: Auth register failed, cannot continue with remaining tests")
        results.print_summary()
        sys.exit(1)
    
    token = auth_data["token"]
    
    test_auth_register_duplicate(test_email, test_password, test_name)
    test_auth_login(test_email, test_password)
    test_auth_login_wrong_password(test_email)
    test_auth_me(token)
    test_auth_me_no_token()
    
    # 3. Library endpoint
    test_library_no_token()
    test_library_with_token(token)
    
    # 4. Stripe Checkout endpoint (LIVE mode - do not pay)
    checkout_data = test_checkout_valid(token)
    test_checkout_unknown_product(token)
    test_checkout_empty_cart(token)
    
    # 5. Status endpoint
    if checkout_data and "session_id" in checkout_data:
        test_payment_status(checkout_data["session_id"])
    else:
        results.add_fail("Payment status", "Skipped - no session_id from checkout")
    
    test_payment_status_nonexistent()
    
    # Print summary
    success = results.print_summary()
    
    if success:
        print("\n✅ All tests passed!")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
