# React + TypeScript + Vite + TW

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js

## Backend Environment

The Hono API runs in the same repo and expects these variables for MongoDB, auth, Firebase Storage, and route proxies:

- `MONGODB_CONNECTION_STRING` for the `default` MongoDB database
- `FIREBASE_PROJECT_ID`
- `FIREBASE_WEB_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`
- `FIREBASE_STORAGE_BUCKET` if you use image uploads
- `CORS_ORIGIN` if your frontend host is not `http://localhost:5173`
- `ORS_API_KEY` for the OpenRouteService itinerary proxy
- `ORS_BASE_URL` (optional override, defaults to `https://api.openrouteservice.org`)

Without the MongoDB connection string, data routes return a structured `503 DATABASE_NOT_CONFIGURED` response. Firebase credentials are still required for the current authentication and upload routes.

## Itinerary proxy API

The server exposes a v2 itinerary endpoint that proxies requests to OpenRouteService while enforcing quota-safe behavior:

- `POST /api/v2/itinerary`
- Body follows the ORS routing format, for example:

```json
{
  "coordinates": [
    [2.3488, 48.8534],
    [2.3321, 48.8361]
  ],
  "profile": "driving-car"
}
```

The proxy will:

- validate the request shape and coordinate count
- cache repeated equivalent searches for five minutes
- enforce a local per-minute quota before calling ORS
- return a structured API error when the ORS key is missing, the quota is reached, or the upstream request fails

This endpoint is documented in the generated OpenAPI specs under `/api/v2/docs` and `/docs/v2`.

import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
