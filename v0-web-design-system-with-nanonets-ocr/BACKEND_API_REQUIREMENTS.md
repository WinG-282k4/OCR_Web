# Backend API Requirements for UI Builder Frontend

This document lists the backend endpoints and behaviors expected by the frontend in this repository.

Base URLs and environment
- Default mock API base (used by `lib/api-client.ts`): `http://localhost:3001/api`
- Next.js internal API base (if using the Next app's API routes): `http://localhost:3000/api`
- Environment variables:
  - `NANONETS_API_KEY` — required if the OCR endpoint proxies to Nanonets.
  - `NEXT_PUBLIC_API_BASE_URL` — optional; overrides the API base used by the frontend.

General notes
- All endpoints should return JSON unless otherwise specified.
- The frontend accepts both `multipart/form-data` image uploads and JSON with base64 image string for OCR.

1) Health
- GET `/api/health`
  - Purpose: simple health check for backend availability.
  - Response 200:
    ```json
    { "status": "healthy" }
    ```

2) OCR (Image analysis / component detection)
- POST `/api/ocr`
  - Accepts either:
    - `multipart/form-data` with field `image` (File), and optional `confidence` (string/number)
    - `application/json` with body `{ "image": "data:image/png;base64,...", "confidence": 0.5 }`
  - Response 200 (OCRResult):
    ```json
    {
      "detectedComponents": [
        {
          "id": "comp_1",         
          "type": "button",      
          "label": "Submit",     
          "confidence": 0.95,     
          "bounds": { "x": 100, "y": 150, "width": 120, "height": 45 }
        }
      ]
    }
    ```
  - Notes:
    - The frontend will try JSON (base64) first, then multipart as a fallback.
    - If proxying to Nanonets, the backend needs `NANONETS_API_KEY` and may require model-specific endpoint adjustments.

3) Projects (CRUD + listing)
- GET `/api/projects?limit={n}&offset={n}`
  - Returns project list (ProjectListResponse): `{ success: true, projects: [...] }`

- POST `/api/projects`
  - Body: `CreateProjectRequest` e.g. `{ name: "My Design", canvasWidth: 1200 }`
  - Returns 201 with created `Project` object.

- GET `/api/projects/{projectId}`
  - Returns full `Project` with `canvasElements`.

- PUT `/api/projects/{projectId}`
  - Body: `UpdateProjectRequest` (can include `canvasElements` array)
  - Returns updated `Project`.

- DELETE `/api/projects/{projectId}`
  - Returns 204 on success.

4) Components (component library)
- GET `/api/components?category={}&search={}`
  - Returns an array of available components/templates used by the palette.

5) Export / Preview
- POST `/api/projects/{projectId}/export`
  - Body: options e.g. `{ includeCSS: true, responsive: true }`
  - Response 200: `ExportResponse` with `html` and optionally `css` strings.

- POST `/api/projects/{projectId}/preview`
  - Returns HTML string (text/html) for preview embedding. Frontend expects to `POST` and receive HTML; if JSON is returned, frontend reads text response.

6) Error handling and status codes
- Standardize on JSON error responses where applicable:
  ```json
  { "error": "message", "details": { ... }, "status": 400 }
  ```
- Use appropriate HTTP status codes: 200, 201, 204, 400, 404, 500.

7) Authentication
- The frontend currently does not require authentication for local development. If you add auth, consider supporting bearer tokens (JWT) and document how to provide them.

8) Mocking
- For local frontend development without a full backend, run the built-in mock server (Prism) using the included OpenAPI schema:
  - `npm run mock-api` (uses `schema.yaml`, serves at `http://localhost:3001/api`)
- This mock will satisfy routes defined in `schema.yaml` and is the fastest way to work with the FE.

9) Quick configuration suggestions
- To point FE to the Next.js API routes instead of the mock, set `.env.local`:
  ```env
  NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
  NANONETS_API_KEY=your_key_if_using_ocr
  ```

10) Reference files in this repo
- `lib/api-client.ts` — shows what endpoints and request formats the frontend expects.
- `app/api/ocr/route.ts` — example OCR route implementation that proxies to Nanonets.
- `schema.yaml` — OpenAPI schema used by the mock server.

If you want, I can also scaffold a minimal Node/Express or Fastify backend that implements these endpoints (mocking OCR locally) so you can run a single backend process instead of Prism.
