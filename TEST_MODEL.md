# Test Model

## 1. Critical User Scenarios
- Authentication: login, logout, session restore from local storage.
- Public schedules: open list, apply search, status filter, time sorting, pagination.
- Role operations: helper responds and cancels response, needy creates and manages own schedule, admin works with attachments.
- File flow: upload valid file, reject invalid file, delete file, request download URL.
- External API: weather block shows normalized data, and the UI degrades safely when the API fails.

## 2. Key Business Rules and Constraints
- Only `HELPER` can use `/helper/**` operations.
- Only `NEEDY` can create and manage schedules through `/needy/**`.
- Attachment upload accepts only configured MIME types and max size.
- `Schedule` can be responded to only in `OPEN` status.
- Pagination request parameters are validated: `page >= 0`, `1 <= size <= 50`, `timeOrder in {nearest,farthest}`.
- Closed or completed schedules must reject invalid helper actions.

## 3. High-Risk Areas
- Authentication and session recovery.
- Role checks and forbidden access.
- File upload validation and object storage integration.
- External weather API availability and graceful degradation.
- Filtering and paging because they directly affect user-visible correctness and query volume.

## 4. Test Layers
- Backend unit: service business rules, file validation, attachment metadata handling.
- Backend web/integration: endpoint status codes, payload structure, request validation, role access.
- Frontend unit/scenario: form submission, loading and error states, session recovery.
- E2E: reserved for full login/CRUD/file/API smoke scenarios once Playwright is added.

## 5. Naming and Structure
- Backend: `src/test/java/.../*Test.java`
- Frontend: `src/.../__tests__/*.test.tsx`
- Fast tests: service and component tests.
- Slower tests: web/integration and future e2e.

## 6. Quality Gates
- Minimum controlled coverage target:
  - backend: critical services and public controllers
  - frontend: critical public flows and session handling
- Every regression in roles, files, filtering, or external API behavior must receive a dedicated automated test.
