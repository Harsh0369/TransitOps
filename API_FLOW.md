# API Integration Flow - TransitOps Frontend

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Client)                        │
├─────────────────────────────────────────────────────────────┤
│  Login Page (app/(auth)/login/page.tsx)                     │
│  └─→ Email & Password Input Form                           │
│      └─→ Calls: login(email, password)                      │
│          └─→ AuthContext (providers/AuthProvider.tsx)       │
│              └─→ authApi.login() (services/api.ts)          │
│                  └─→ Axios Client (lib/axios.ts)           │
│                      └─→ POST /auth/login                   │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
                    [HTTP over network]
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Server)                          │
├─────────────────────────────────────────────────────────────┤
│  Auth Route (src/routes/auth.route.ts)                      │
│  └─→ Auth Controller (src/controllers/auth.controller.ts)   │
│      └─→ Auth Service (src/services/auth.service.ts)        │
│          └─→ Validate credentials & Generate JWT            │
└─────────────────────────────────────────────────────────────┘
```

## Step-by-Step Authentication Flow

### 1️⃣ User Submits Login Form
```
Location: client/app/(auth)/login/page.tsx

User fills in:
├── Email: user@example.com
├── Password: password123
└── Clicks "Sign In"

Triggers:
handleSubmit() → login(email, password)
```

### 2️⃣ AuthContext Calls API
```
Location: client/providers/AuthProvider.tsx

const login = async (email: string, password: string) => {
  try {
    const response = await authApi.login({ email, password });
    
    if (response.success && response.data) {
      const { token, user: userData } = response.data;
      
      // Store token
      localStorage.setItem("transitops_token", token);
      
      // Store user
      localStorage.setItem("transitops_user", JSON.stringify(userData));
      
      // Redirect based on role
      const redirectPath = getRoleBasedRedirect(userData.role);
      router.push(redirectPath);
    }
  } catch (err) {
    setError(err.message);
  }
};
```

### 3️⃣ API Service Makes HTTP Request
```
Location: client/services/api.ts

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }
};

HTTP Request:
POST http://localhost:8000/api/auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}
```

### 4️⃣ Axios Client Processes Request
```
Location: client/lib/axios.ts

Request Interceptor:
├── Check if user is authenticated
├── Get token from localStorage: localStorage.getItem('transitops_token')
└── Attach to header: Authorization: Bearer {token}

HTTP Headers Sent:
├── Content-Type: application/json
└── Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

↓ Request sent to backend ↓
```

### 5️⃣ Backend Processes & Responds
```
Backend Flow:
POST /auth/login
└── Validate email & password
└── Generate JWT token
└── Return response

Success Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user123",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "Fleet Manager"
    }
  }
}

Error Response (401):
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 6️⃣ Axios Response Interceptor
```
Location: client/lib/axios.ts

Response Interceptor:
├── Status 200 OK
│   └─ Forward response to caller
├── Status 401 Unauthorized
│   ├─ localStorage.removeItem('transitops_token')
│   ├─ localStorage.removeItem('transitops_user')
│   └─ window.location.href = '/login'
└── Status 403 Forbidden
    └─ console.error('[API] Permission denied')
```

### 7️⃣ Store Token & User Data
```
Location: AuthContext login function

localStorage:
{
  "transitops_token": "eyJhbGciOiJIUzI1NiIs...",
  "transitops_user": {
    "id": "user123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "Fleet Manager"
  }
}
```

### 8️⃣ Role-Based Redirection
```
Location: client/providers/AuthProvider.tsx

const getRoleBasedRedirect = (role: string): string => {
  switch (role) {
    case "Fleet Manager":
      return "/dashboard";
    case "Dispatcher":
      return "/trips";
    case "Safety Officer":
      return "/drivers";
    case "Financial Analyst":
      return "/analytics";
    default:
      return "/dashboard";
  }
};

User is redirected to role-specific page
```

### 9️⃣ Protected Route Access
```
Location: client/app/(dashboard)/layout.tsx

<RouteGuard>
  <DashboardLayout>
    {children}
  </DashboardLayout>
</RouteGuard>

RouteGuard checks:
├── Is user authenticated? (user !== null)
├── Is loading complete?
└── If not: redirect to /login
    If yes: render dashboard
```

### 🔟 Subsequent API Calls
```
All API requests after login include JWT token automatically:

GET /api/drivers
Headers:
├── Content-Type: application/json
└── Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response:
├── 200 OK → Return data
├── 401 → Clear token & redirect to login
└── 403 → Log permission error
```

## Authentication Flow Diagram

```
┌──────────────────┐
│   Login Page     │
│  Email/Password  │
└────────┬─────────┘
         │ Submits form
         ↓
┌──────────────────────────────┐
│   AuthContext.login()        │
│  (providers/AuthProvider)    │
└────────┬─────────────────────┘
         │ Call authApi.login(credentials)
         ↓
┌──────────────────────────────┐
│   authApi.login()            │
│  (services/api.ts)           │
└────────┬─────────────────────┘
         │ Call apiClient.post()
         ↓
┌──────────────────────────────┐
│   Axios Request Interceptor  │
│  (lib/axios.ts)              │
│  ├─ Get token from storage   │
│  ├─ Attach to header         │
│  └─ Send HTTP request        │
└────────┬─────────────────────┘
         │ POST /auth/login
         ↓ [Network]
┌──────────────────────────────┐
│    Backend Processing        │
│  (Node.js Server)            │
│  ├─ Validate credentials     │
│  ├─ Generate JWT             │
│  └─ Return user & token      │
└────────┬─────────────────────┘
         │ HTTP 200 OK
         ↓ [Network]
┌──────────────────────────────┐
│   Axios Response Interceptor │
│  (lib/axios.ts)              │
│  ├─ Check status (200/401)   │
│  └─ Forward response         │
└────────┬─────────────────────┘
         │ Response data
         ↓
┌──────────────────────────────┐
│   AuthContext.login()        │
│  ├─ Store token in storage   │
│  ├─ Store user in storage    │
│  └─ Redirect by role         │
└────────┬─────────────────────┘
         │ router.push(rolePath)
         ↓
┌──────────────────────────────┐
│    Role-based Dashboard      │
│  (Redirected page)           │
│  ├─ /dashboard               │
│  ├─ /trips                   │
│  ├─ /drivers                 │
│  └─ /analytics               │
└──────────────────────────────┘
```

## Token Usage in Subsequent Requests

```
User navigates to: GET /api/drivers

Request Flow:
1. Sidebar component calls: useAuth() → user data from context
2. Page component makes API call: apiClient.get('/drivers')
3. Request Interceptor:
   ├─ Gets token: localStorage.getItem('transitops_token')
   ├─ Sets header: Authorization: Bearer {token}
   └─ Sends request
4. Backend validates token
5. Response Interceptor handles response or errors
```

## Error Handling Scenarios

### Scenario 1: Invalid Credentials
```
POST /auth/login with wrong password

Backend Response (401):
{
  "success": false,
  "message": "Invalid email or password"
}

Frontend Handling:
├─ Catch error in login()
├─ Set error state: setError(errorMsg)
├─ Display error in red alert box
└─ Keep user on login page
```

### Scenario 2: Expired Token
```
GET /api/drivers with expired token

Backend Response (401):
Authorization header with invalid/expired token

Frontend Handling (Response Interceptor):
├─ Detect 401 status
├─ Clear localStorage tokens
├─ Redirect to /login
└─ User sees login form again
```

### Scenario 3: Permission Denied
```
GET /api/maintenance as Dispatcher (not allowed)

Backend Response (403):
{
  "message": "Forbidden - insufficient permissions"
}

Frontend Handling (Response Interceptor):
├─ Detect 403 status
├─ Log error: console.error('[API] Permission denied')
└─ Return error to caller
```

## Component Dependency Chain

```
app/
├─ (auth)/login/page.tsx
│  └─ Uses: useAuth() hook
│     └─ From: AuthContext
│
└─ (dashboard)/layout.tsx
   ├─ Uses: RouteGuard component
   │  ├─ Uses: useAuth() hook
   │  └─ Uses: useRouter() from Next.js
   │
   ├─ Sidebar
   │  └─ Uses: useAuth() hook
   │     └─ Displays user info from context
   │
   └─ TopNavbar
      └─ Uses: useAuth() hook
         └─ Logout button calls logout()
            └─ Clears storage & redirects

hooks/
└─ useAuth.ts
   └─ Reads from: AuthContext

providers/
└─ AuthProvider.tsx
   ├─ Uses: authApi.login()
   ├─ Uses: localStorage
   ├─ Uses: useRouter()
   └─ Exports: AuthContext

services/
└─ api.ts
   └─ Uses: apiClient (axios instance)

lib/
└─ axios.ts
   ├─ Creates: Axios instance
   ├─ Request interceptor
   └─ Response interceptor
      └─ Uses: localStorage
      └─ Uses: window.location
```

## Key Files & Their Responsibilities

| File | Responsibility |
|------|-----------------|
| `app/(auth)/login/page.tsx` | User login UI |
| `providers/AuthProvider.tsx` | Authentication state & API calls |
| `services/api.ts` | API endpoint definitions |
| `lib/axios.ts` | HTTP client with interceptors |
| `components/auth/RouteGuard.tsx` | Protected route wrapper |
| `components/auth/RoleGuard.tsx` | Role-based access control |
| `hooks/useAuth.ts` | Hook to access auth context |

## Summary

The authentication system is a complete end-to-end flow where:
1. Login page collects credentials
2. AuthContext calls API service
3. API service uses Axios client
4. Axios adds JWT token to requests automatically
5. Backend validates and returns user data + token
6. Frontend stores token for future requests
7. User is redirected based on role
8. All subsequent requests include token via interceptor
9. 401 responses trigger re-authentication
10. RouteGuard protects dashboard routes

