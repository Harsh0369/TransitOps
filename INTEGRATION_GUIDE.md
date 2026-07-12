# TransitOps Frontend - API Integration Guide

## Overview

The frontend has been successfully connected to the Node.js backend with real API integration. All mock authentication has been removed and replaced with real JWT token-based authentication.

## Key Changes

### 1. **Axios HTTP Client** (`client/lib/axios.ts`)
- Reusable Axios client with base URL: `http://localhost:8000/api`
- **Request Interceptor**: Automatically attaches JWT token from localStorage to all requests
- **Response Interceptor**: Handles errors globally
  - **401 Unauthorized**: Clears token and redirects to login
  - **403 Forbidden**: Logs permission denied (can be extended with toast notifications)

### 2. **API Service** (`client/services/api.ts`)
- Centralized API functions for authentication
- `authApi.login(credentials)`: Sends POST request to `/auth/login`
  - Accepts: `{ email, password }`
  - Returns: `{ success, message, data: { token, user } }`

### 3. **Authentication Provider** (`client/providers/AuthProvider.tsx`)
- Replaced mock login with real API integration
- **Token Storage**: JWT token stored in `localStorage` as `transitops_token`
- **User Storage**: User data stored in `localStorage` as `transitops_user`
- **Role-Based Redirection**: After login, automatically redirects to role-specific landing pages:
  - **Fleet Manager** → `/dashboard`
  - **Dispatcher** → `/trips`
  - **Safety Officer** → `/drivers`
  - **Financial Analyst** → `/analytics`
- **Error Handling**: Exposes error state for UI display

### 4. **Login Page** (`client/app/(auth)/login/page.tsx`)
- Updated to accept email and password inputs
- Removed hardcoded role selection UI
- Displays login errors from backend
- Loading state during authentication
- Form inputs disabled while request is in flight

### 5. **Route Protection** (`client/components/auth/RouteGuard.tsx`)
- New component to protect dashboard routes
- Redirects unauthenticated users to login
- Applied to dashboard layout (`client/app/(dashboard)/layout.tsx`)

### 6. **Environment Configuration** (`client/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## API Contract

### Login Endpoint
**POST** `/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user123",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "Fleet Manager"
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

## File Structure

```
client/
├── lib/
│   ├── axios.ts                    # Axios HTTP client with interceptors
│   └── utils.ts
├── services/
│   └── api.ts                      # API service functions
├── providers/
│   ├── AuthProvider.tsx            # Updated with real API integration
│   └── AppProvider.tsx
├── hooks/
│   └── useAuth.ts
├── components/
│   ├── auth/
│   │   ├── RoleGuard.tsx           # Role-based access control
│   │   └── RouteGuard.tsx          # NEW: Route protection
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── TopNavbar.tsx
│   └── ...
├── types/
│   └── auth.ts
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx            # Updated login form
│   ├── (dashboard)/
│   │   └── layout.tsx              # Now uses RouteGuard
│   └── layout.tsx
├── .env.local                      # NEW: Environment config
└── package.json
```

## Dependencies

Added:
- `axios@^1.7.2` - HTTP client library

## How It Works

### Authentication Flow
1. User enters email and password on login page
2. Form submission calls `login(email, password)` from AuthContext
3. API client sends POST request to `/auth/login` with credentials
4. Backend validates and returns token + user data
5. Token and user stored in localStorage
6. User automatically redirected to role-specific dashboard
7. All subsequent API requests include the JWT token

### Protected Routes
- Dashboard layout is wrapped with `RouteGuard`
- Unauthenticated users are redirected to login
- Token is automatically included in all API requests via interceptor

### Error Handling
- **401 Responses**: Token cleared, user redirected to login
- **403 Responses**: Logged (can be extended to show toast)
- **Other Errors**: Returned to caller with error message

## Configuration Notes

### Development
- API runs on `http://localhost:8000`
- Frontend runs on `http://localhost:3000`
- Token expires based on backend configuration
- Both should be running simultaneously

### Production
- Update `NEXT_PUBLIC_API_URL` in environment variables
- Ensure CORS is properly configured on backend
- Use secure cookies or HttpOnly tokens for production (consider migration)

## Testing the Integration

### Test Credentials
Use credentials created in your backend:
```
Email: test@example.com
Password: password123
```

### Manual Testing Steps
1. Start backend: `cd server && npm run dev`
2. Start frontend: `cd client && npm run dev`
3. Navigate to `http://localhost:3000/login`
4. Enter test credentials
5. Verify redirect to role-based dashboard
6. Check localStorage for `transitops_token` and `transitops_user`
7. Try logging out using TopNavbar logout button

## Future Enhancements

- [ ] Add refresh token rotation
- [ ] Implement toast notifications for 403 errors
- [ ] Add password reset flow
- [ ] Implement "Remember me" functionality
- [ ] Add 2FA support
- [ ] Migrate to HttpOnly cookies for token storage
- [ ] Add request/response logging for debugging

## Troubleshooting

### "Cannot find module 'axios'"
- Run `npm install axios` in client directory
- Restart dev server

### CORS errors
- Check backend CORS configuration
- Ensure backend is accepting requests from frontend origin

### Token not persisting
- Check browser localStorage is enabled
- Verify token is returned in login response

### User redirected to login after page refresh
- Ensure `transitops_user` is being stored correctly
- Check localStorage in browser dev tools

### 401 errors after login
- Verify JWT token format in Authorization header
- Check backend token validation logic
- Ensure token hasn't expired

