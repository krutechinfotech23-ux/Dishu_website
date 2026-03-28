import requests
import json
import uuid
from datetime import datetime

class DishuStudioAPITester:
    def __init__(self, base_url="https://dishu-preview.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "passed": success,
            "details": details
        })
        return success

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        
        # Test root endpoint
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200 and "Welcome to Dishu Studio API" in response.text
            self.log_test("Root endpoint (/api/)", success, 
                         f"Status: {response.status_code}, Response: {response.text}" if not success else "")
        except Exception as e:
            self.log_test("Root endpoint (/api/)", False, str(e))

        # Test health endpoint
        try:
            response = requests.get(f"{self.api_url}/health", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = data.get("status") == "healthy"
            self.log_test("Health endpoint (/api/health)", success,
                         f"Status: {response.status_code}" if not success else "")
        except Exception as e:
            self.log_test("Health endpoint (/api/health)", False, str(e))

    def test_admin_setup(self):
        """Test admin setup endpoint"""
        print("\n🔍 Testing Admin Setup...")
        
        try:
            response = requests.post(f"{self.api_url}/auth/setup", timeout=10)
            success = response.status_code == 200
            self.log_test("Admin setup (/api/auth/setup)", success,
                         f"Status: {response.status_code}, Response: {response.text}" if not success else "")
        except Exception as e:
            self.log_test("Admin setup (/api/auth/setup)", False, str(e))

    def test_admin_login(self):
        """Test admin login"""
        print("\n🔍 Testing Admin Login...")
        
        try:
            login_data = {"username": "admin", "password": "admin123"}
            response = requests.post(f"{self.api_url}/auth/login", json=login_data, timeout=10)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                if "access_token" in data:
                    self.token = data["access_token"]
                    print(f"🔑 Admin token obtained")
                else:
                    success = False
            
            self.log_test("Admin login (/api/auth/login)", success,
                         f"Status: {response.status_code}" if not success else "")
            
            return success
        except Exception as e:
            self.log_test("Admin login (/api/auth/login)", False, str(e))
            return False

    def test_booking_creation(self):
        """Test booking creation"""
        print("\n🔍 Testing Booking Creation...")
        
        test_booking = {
            "name": f"Test User {uuid.uuid4().hex[:8]}",
            "phone": "+91 9876543210",
            "email": f"test{uuid.uuid4().hex[:8]}@example.com",
            "service_type": "Wedding",
            "preferred_date": "2024-12-25",
            "message": "Test booking message"
        }
        
        try:
            response = requests.post(f"{self.api_url}/bookings", json=test_booking, timeout=15)
            success = response.status_code == 200
            
            booking_id = None
            if success:
                data = response.json()
                booking_id = data.get("id")
                if not booking_id:
                    success = False
            
            self.log_test("Create booking (/api/bookings)", success,
                         f"Status: {response.status_code}" if not success else "")
            
            return booking_id if success else None
        except Exception as e:
            self.log_test("Create booking (/api/bookings)", False, str(e))
            return None

    def test_admin_bookings_crud(self):
        """Test admin CRUD operations on bookings"""
        print("\n🔍 Testing Admin Bookings CRUD...")
        
        if not self.token:
            self.log_test("Admin CRUD operations", False, "No admin token available")
            return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Test get all bookings
        try:
            response = requests.get(f"{self.api_url}/bookings", headers=headers, timeout=10)
            success = response.status_code == 200
            bookings = response.json() if success else []
            self.log_test("Get all bookings (/api/bookings)", success,
                         f"Status: {response.status_code}" if not success else "")
            
            # If we have bookings, test update and delete
            if bookings:
                booking_id = bookings[0]["id"]
                
                # Test update booking status
                try:
                    update_data = {"status": "Confirmed"}
                    response = requests.patch(f"{self.api_url}/bookings/{booking_id}", 
                                            json=update_data, headers=headers, timeout=10)
                    success = response.status_code == 200
                    self.log_test("Update booking status", success,
                                 f"Status: {response.status_code}" if not success else "")
                except Exception as e:
                    self.log_test("Update booking status", False, str(e))
                
                # Test delete booking
                try:
                    response = requests.delete(f"{self.api_url}/bookings/{booking_id}", 
                                             headers=headers, timeout=10)
                    success = response.status_code == 200
                    self.log_test("Delete booking", success,
                                 f"Status: {response.status_code}" if not success else "")
                except Exception as e:
                    self.log_test("Delete booking", False, str(e))
            
        except Exception as e:
            self.log_test("Get all bookings (/api/bookings)", False, str(e))

    def test_stats_endpoint(self):
        """Test stats endpoint"""
        print("\n🔍 Testing Stats Endpoint...")
        
        if not self.token:
            self.log_test("Stats endpoint", False, "No admin token available")
            return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        try:
            response = requests.get(f"{self.api_url}/stats", headers=headers, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                expected_keys = ["total", "pending", "confirmed", "cancelled", "wedding", "baby"]
                if not all(key in data for key in expected_keys):
                    success = False
                    
            self.log_test("Get stats (/api/stats)", success,
                         f"Status: {response.status_code}" if not success else "")
        except Exception as e:
            self.log_test("Get stats (/api/stats)", False, str(e))

    def test_contact_form(self):
        """Test contact form submission"""
        print("\n🔍 Testing Contact Form...")
        
        contact_data = {
            "name": f"Contact Test {uuid.uuid4().hex[:8]}",
            "email": f"contact{uuid.uuid4().hex[:8]}@example.com",
            "phone": "+91 9876543210",
            "message": "Test contact message"
        }
        
        try:
            response = requests.post(f"{self.api_url}/contact", json=contact_data, timeout=15)
            success = response.status_code == 200
            self.log_test("Contact form submission (/api/contact)", success,
                         f"Status: {response.status_code}" if not success else "")
        except Exception as e:
            self.log_test("Contact form submission (/api/contact)", False, str(e))

    def test_auth_verification(self):
        """Test auth token verification"""
        print("\n🔍 Testing Auth Verification...")
        
        if not self.token:
            self.log_test("Auth verification", False, "No admin token available")
            return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        try:
            response = requests.get(f"{self.api_url}/auth/verify", headers=headers, timeout=10)
            success = response.status_code == 200
            self.log_test("Auth verification (/api/auth/verify)", success,
                         f"Status: {response.status_code}" if not success else "")
        except Exception as e:
            self.log_test("Auth verification (/api/auth/verify)", False, str(e))

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Dishu Studio Backend API Tests...")
        print(f"🎯 Testing against: {self.base_url}")
        
        # Test in logical order
        self.test_health_endpoints()
        self.test_admin_setup()
        
        # Login required for subsequent tests
        if self.test_admin_login():
            self.test_auth_verification()
            self.test_stats_endpoint()
            self.test_admin_bookings_crud()
        
        # Test public endpoints
        booking_id = self.test_booking_creation()
        self.test_contact_form()
        
        # Final results
        print(f"\n📊 Backend Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        print(f"🎯 Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "success_rate": (self.tests_passed/self.tests_run)*100 if self.tests_run > 0 else 0,
            "details": self.test_results
        }

if __name__ == "__main__":
    tester = DishuStudioAPITester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    exit_code = 0 if results["success_rate"] >= 80 else 1
    exit(exit_code)