# FitTrack API Testing Guide - Thunder Client

## Base URL

```
http://localhost:3000
```

---

## 1. SIGNUP (Create New User)

**Method:** `POST`  
**URL:** `http://localhost:3000/signup`  
**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Expected Response (201):**

```json
{
  "message": "User created successfully"
}
```

**Error Response (400):**

```json
{
  "error": "Email already registered"
}
```

---

## 2. LOGIN (Get Auth Token)

**Method:** `POST`  
**URL:** `http://localhost:3000/login`  
**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Expected Response (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "john_doe"
}
```

**Error Response (400):**

```json
{
  "error": "Invalid email or password"
}
```

---

## 3. GET ALL EXERCISES (Protected)

**Method:** `GET`  
**URL:** `http://localhost:3000/api/exercises`  
**Headers:**

```
Authorization: Bearer {TOKEN_FROM_LOGIN}
```

**Expected Response (200):**

```json
[
  {
    "id": 1,
    "name": "Push-ups",
    "sets": 3,
    "reps": 10,
    "duration": 0,
    "createdAt": "2025-12-21T10:00:00Z",
    "updatedAt": "2025-12-21T10:00:00Z"
  }
]
```

---

## 4. CREATE NEW EXERCISE (Protected)

**Method:** `POST`  
**URL:** `http://localhost:3000/api/exercises`  
**Headers:**

```
Authorization: Bearer {TOKEN_FROM_LOGIN}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Squats",
  "sets": 4,
  "reps": 12,
  "duration": 30
}
```

**Expected Response (201):**

```json
{
  "id": 1,
  "name": "Squats",
  "sets": 4,
  "reps": 12,
  "duration": 30,
  "createdAt": "2025-12-21T10:00:00Z",
  "updatedAt": "2025-12-21T10:00:00Z"
}
```

---

## 5. GET USER'S WEEKLY SCHEDULE (Protected)

**Method:** `GET`  
**URL:** `http://localhost:3000/api/schedule`  
**Headers:**

```
Authorization: Bearer {TOKEN_FROM_LOGIN}
```

**Expected Response (200):**

```json
[
  {
    "id": 1,
    "userId": 1,
    "dayOfWeek": "Monday",
    "exerciseId": 1,
    "exercise": {
      "id": 1,
      "name": "Squats",
      "sets": 4,
      "reps": 12,
      "duration": 30
    },
    "createdAt": "2025-12-21T10:00:00Z",
    "updatedAt": "2025-12-21T10:00:00Z"
  }
]
```

---

## 6. ADD EXERCISE TO SCHEDULE (Protected)

**Method:** `POST`  
**URL:** `http://localhost:3000/api/schedule`  
**Headers:**

```
Authorization: Bearer {TOKEN_FROM_LOGIN}
Content-Type: application/json
```

**Request Body:**

```json
{
  "dayOfWeek": "Monday",
  "exerciseId": 1
}
```

**Expected Response (201):**

```json
{
  "id": 1,
  "userId": 1,
  "dayOfWeek": "Monday",
  "exerciseId": 1,
  "exercise": {
    "id": 1,
    "name": "Squats",
    "sets": 4,
    "reps": 12,
    "duration": 30
  },
  "createdAt": "2025-12-21T10:00:00Z",
  "updatedAt": "2025-12-21T10:00:00Z"
}
```

---

## 7. REMOVE EXERCISE FROM SCHEDULE (Protected)

**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/schedule`  
**Headers:**

```
Authorization: Bearer {TOKEN_FROM_LOGIN}
Content-Type: application/json
```

**Request Body:**

```json
{
  "dayOfWeek": "Monday",
  "exerciseId": 1
}
```

**Expected Response (200):**

```json
{
  "message": "Removed from schedule"
}
```

---

## 8. DELETE EXERCISE (Protected)

**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/exercises/1`  
**Headers:**

```
Authorization: Bearer {TOKEN_FROM_LOGIN}
```

**Expected Response (200):**

```json
{
  "message": "Exercise deleted"
}
```

---

## Testing Steps in Thunder Client

1. **First, Sign Up:**

   - Use request #1 with a new email and username
   - Change the username and email for each test

2. **Then, Login:**

   - Use request #2 with the email/password you just created
   - **Copy the token from the response**

3. **Use the Token:**

   - For all protected requests (3-8), replace `{TOKEN_FROM_LOGIN}` with the actual token
   - Example: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

4. **Test Protected Endpoints:**
   - Create exercises (#4)
   - Add to schedule (#6)
   - View schedule (#5)
   - Remove from schedule (#7)
   - Delete exercises (#8)

---

## Common Status Codes

| Code | Meaning                                       |
| ---- | --------------------------------------------- |
| 200  | OK - Request successful                       |
| 201  | Created - Resource created successfully       |
| 400  | Bad Request - Invalid input or missing fields |
| 401  | Unauthorized - Missing or invalid token       |
| 500  | Internal Server Error - Server error          |

---

## Tips

- **Save the token** after login - you'll need it for all other requests
- **Use different emails** for each signup test
- **Check the error messages** if a request fails
- **Verify the server is running** on `localhost:3000` before testing
- **Use the Authorization tab** in Thunder Client to easily manage bearer tokens
