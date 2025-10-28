# 🚀 POSTMAN API TESTS FOR DRYP BACKEND

## 📋 **Setup Instructions:**

1. **Open Postman**
2. **Create New Collection** called "DRYP API Tests"
3. **Set Base URL**: `http://localhost:5001`

---

## 🧪 **TEST 1: Health Check**
**Method:** `GET`  
**URL:** `http://localhost:5001/health`  
**Expected Response:**
```json
{
  "status": "ok"
}
```

---

## 🧪 **TEST 2: User Registration**
**Method:** `POST`  
**URL:** `http://localhost:5001/api/auth/register`  
**Headers:**
```
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "name": "Test User Postman",
  "email": "postman@test.com",
  "password": "testpass123"
}
```
**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "Test User Postman",
    "email": "postman@test.com",
    "_id": "...",
    "createdAt": "..."
  }
}
```

---

## 🧪 **TEST 3: Like a Product (FIXED VERSION)**
**Method:** `POST`  
**URL:** `http://localhost:5001/api/likes/casual_1`  
**Headers:**
```
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "userId": "anonymous_user",
  "productId": "casual_1",
  "action": "like"
}
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully liked casual_1",
  "productId": "casual_1",
  "mongoId": "507f1f77bcf86cd799439011"
}
```

---

## 🧪 **TEST 4: Unlike a Product**
**Method:** `DELETE`  
**URL:** `http://localhost:5001/api/likes/casual_1`  
**Headers:**
```
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "userId": "anonymous_user",
  "productId": "casual_1",
  "action": "dislike"
}
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully unliked casual_1",
  "productId": "casual_1",
  "mongoId": "507f1f77bcf86cd799439011"
}
```

---

## 🧪 **TEST 5: Like Different Products**
Try these product IDs to test the mapping system:

### Like Casual Product:
`POST http://localhost:5001/api/likes/casual_2`

### Like Formal Product:
`POST http://localhost:5001/api/likes/formal_1`

### Like Street Product:
`POST http://localhost:5001/api/likes/street_1`

### Like Seasonal Product:
`POST http://localhost:5001/api/likes/seasonal_1`

---

## 📊 **MONITORING MONGODB ATLAS REAL-TIME:**

### **Method 1: Atlas Dashboard**
1. Go to https://cloud.mongodb.com/
2. Select your cluster "casapp"
3. Click **"Browse Collections"**
4. You should see:
   - **users** collection (for registered users)
   - **likes** collection (for product likes)
5. **Refresh the page** after each Postman test to see new data

### **Method 2: Atlas Real-Time Monitoring**
1. In Atlas Dashboard, click **"Metrics"**
2. Look for **"Operations"** graph
3. You'll see spikes when API calls hit the database

### **Method 3: Atlas Data Explorer**
1. Click **"Browse Collections"**
2. Select **"likes"** collection
3. Click **"Refresh"** button after each test
4. You should see new documents appearing

---

## 🔍 **WHAT TO LOOK FOR IN MONGODB:**

### **In `users` collection:**
```json
{
  "_id": "690144ae45d8e961f62e1088",
  "name": "Test User Postman",
  "email": "postman@test.com",
  "passwordHash": "$2a$10$...",
  "likedProducts": [],
  "createdAt": "2025-10-28T22:33:18.636Z"
}
```

### **In `likes` collection:**
```json
{
  "_id": "690148...",
  "user": "anonymous_user",
  "product": "507f1f77bcf86cd799439011",
  "createdAt": "2025-10-28T22:48:13.388Z"
}
```

---

## 🚨 **TROUBLESHOOTING:**

### **If you get "Connection Refused":**
- Check if backend is running: Look for "Server running on port 5001"
- Try: `http://localhost:5001/health` first

### **If you get "ObjectId Cast Error":**
- Use the product IDs from the mapping: `casual_1`, `formal_1`, `street_1`, etc.
- Don't use random strings

### **If MongoDB doesn't update:**
- Check Atlas IP whitelist (should include your IP or 0.0.0.0/0)
- Look for "MongoDB connected" in backend console
- Refresh Atlas dashboard manually

---

## ✅ **SUCCESS INDICATORS:**

1. **Postman Tests Pass** ✅
2. **Backend Console Shows API Calls** ✅  
3. **MongoDB Atlas Shows New Documents** ✅
4. **No Error Messages** ✅

**Test these in order and you'll see real-time data flowing to MongoDB! 🎯**
