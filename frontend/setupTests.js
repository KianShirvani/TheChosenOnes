// setupTests.js
import '@testing-library/jest-dom';

// Mock fetch API，防止 CORS & Network request failed
global.fetch = jest.fn((url) =>
  Promise.resolve({
    ok: true,
    json: async () => {
      console.log(`✅ Mock Fetch called for URL: ${url}`);
      return [
        { id: 1, title: "Task 1", status: "To-Do" },
        { id: 2, title: "Task 2", status: "In Progress" },
      ];
    },
  })
);
