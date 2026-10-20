# React Authentication App

A React 19 single-page application built with Vite, React Router, Axios, and Tailwind CSS. It connects to a Node.js authentication API and uses secure, HttpOnly cookies for browser-managed sessions.

## Table of contents

- [Requirements](#requirements)
- [Run locally](#run-locally)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [Authentication implementation](#authentication-implementation)
- [API contract](#api-contract)
- [Password rules](#password-rules)
- [Backend and cookie requirements](#backend-and-cookie-requirements)
- [Validation commands](#validation-commands)

## Requirements

- Node.js and npm
- The matching Node.js authentication API running on `http://localhost:5000`

## Run locally

From the frontend project directory:

```bash
npm install
npm run dev
```

Vite serves the app at **http://localhost:5173**. The development server uses a strict port: it exits instead of silently selecting a different port, which helps keep the origin aligned with the backend CORS configuration.

Useful commands:

```bash
npm run lint
npm run build
npm run preview
```

`npm run preview` serves the production build locally after `npm run build`.

## Configuration

Development settings are in `vite.config.js`:

- Frontend origin: `http://localhost:5173`
- API proxy: requests beginning with `/api` are forwarded to `http://localhost:5000`
- Vite is configured with `port: 5173` and `strictPort: true`

The frontend uses relative API paths through the Vite proxy, so no frontend `.env` file or API URL variable is required for the documented local setup. Configure the backend's `CLIENT_ORIGIN` to exactly `http://localhost:5173`.

Use `localhost` consistently for both services; do not mix it with `127.0.0.1`.

## Project structure

```text
.
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
├── public/
└── src/
    ├── api.js
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── assets/
    ├── components/
    │   ├── Navbar.jsx
    │   ├── NotFound.jsx
    │   └── ProtectedRoute.jsx
    ├── pages/
    │   ├── Home.jsx
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   └── ChangePassword.jsx
    └── utils/
        └── passwordValidation.js
```

### Important files

| File | Responsibility |
| --- | --- |
| `src/main.jsx` | Mounts the React application and imports global styles. |
| `src/App.jsx` | Owns public user state, restores the session at startup, configures routes, and coordinates logout. |
| `src/api.js` | Shared Axios client with credentials enabled and the 401 refresh-and-retry interceptor. |
| `src/components/ProtectedRoute.jsx` | Redirects visitors without a user session to the login page. |
| `src/components/Navbar.jsx` | Shows navigation and the logout action, including logout loading/error/success feedback. |
| `src/pages/Login.jsx` | Login form and API request. |
| `src/pages/Register.jsx` | Registration form, new-password validation, and API request. |
| `src/pages/ChangePassword.jsx` | Protected password-change form, validation, and API request. |
| `src/utils/passwordValidation.js` | Shared minimum-character and maximum UTF-8-byte validation for new passwords. |
| `src/pages/Home.jsx` | Displays the welcome screen and public user details. |
| `src/components/NotFound.jsx` | Not-found page for unmatched routes. |
| `src/index.css` | Tailwind CSS entry point and global styles. |
| `vite.config.js` | React/Tailwind plugins, development port, and backend proxy. |

## Authentication implementation

### Cookie handling and API client

All authentication API calls use the shared Axios instance in `src/api.js`. It sets `withCredentials: true`, allowing the browser to attach and accept cookies. React code does not inspect cookie values or place tokens in application state, local storage, session storage, or request headers.

### Session restoration

When the app starts, `src/App.jsx` requests `GET /api/users/me`. The shared interceptor handles an expired access cookie by sending one refresh request and retrying the original request. The app shows a loading screen while session restoration is in progress. If refresh fails, it treats the visitor as signed out.

### Refresh and retry

For a protected request that returns HTTP 401, the interceptor:

1. Marks the original request so it cannot retry repeatedly.
2. Shares a single in-flight refresh request across simultaneous 401 responses.
3. Retries the original request once after refresh succeeds.
4. Signals session expiration if refresh or the retry fails.

Failed login, registration, and refresh requests do not start another refresh. Logout is allowed one refresh-and-retry attempt before reporting an error.

### Routes

| Path | Access |
| --- | --- |
| `/` | Public home page; displays signed-in user details when available. |
| `/login` | Signed-out visitors. |
| `/register` | Signed-out visitors. |
| `/change-password` | Authenticated users only. |

### Logout

Logout sends `POST /api/users/logout`. The user is cleared from React state and success is shown only after the API confirms `Logged out successfully`. On failure, the app reports the error and does not claim the server session was revoked.

## API contract

The API base path is `/api/users`. In development, requests pass through the Vite proxy to `http://localhost:5000`.

| Method | Endpoint | Request body | Expected success response |
| --- | --- | --- | --- |
| `POST` | `/api/users/register` | `{ "username", "email", "password" }` | `{ "user": { "id", "username", "email" } }`; sets auth cookies. |
| `POST` | `/api/users/login` | `{ "email", "password" }` | `{ "user": { "id", "username", "email" } }`; sets auth cookies. |
| `GET` | `/api/users/me` | None | `{ "id", "username", "email" }`. |
| `POST` | `/api/users/refresh-token` | None | `{ "message": "Session refreshed" }`; rotates and sets cookies. |
| `PATCH` | `/api/users/change-password` | `{ "currentPassword", "newPassword" }` | `{ "user": { "id", "username", "email" } }`; rotates the session and sets cookies. |
| `POST` | `/api/users/logout` | None | `{ "message": "Logged out successfully" }`; invalidates session and clears cookies. |

Forms display API-provided error messages when available and otherwise show a local fallback. Passwords are sent only in request bodies, never in URLs or logs.

## Password rules

- Registration and new passwords must be at least 8 characters and no more than 72 UTF-8 bytes.
- The change-password form requires the current password but does not impose the new-password minimum on it. Existing accounts with shorter passwords can continue to log in.
- The backend remains responsible for enforcing these rules as the authoritative validation.

## Backend and cookie requirements

The backend must:

- Allow credentialed requests from the exact frontend origin, `http://localhost:5173`, without wildcard CORS origins.
- Set authentication cookies as `HttpOnly`, `Secure`, and `SameSite=Strict`.
- Provide `/api/users/logout`, which invalidates the server session and clears both cookies.
- Scope the refresh cookie to `/api/users/refresh-token` and implement refresh rotation as documented by the API.

Because cookies are `Secure`, browser acceptance can vary by browser and local setup. Do not weaken cookie security to work around this. If cookies are rejected during local development, configure local HTTPS for the frontend and backend and update `CLIENT_ORIGIN` to the exact HTTPS origin.

## Validation commands

```bash
npm run lint
npm run build
```

There is currently no test script or test suite configured in `package.json`. Successful linting and building do not verify the live backend, CORS, or browser cookie behavior; verify those separately in your local environment.
