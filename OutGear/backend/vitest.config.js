import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      PORT: "5001",
      MONGO_URI: "mongodb://127.0.0.1:27017/outdoor_rental_test",
      JWT_SECRET: "test-secret-key",
      JWT_EXPIRES_IN: "1h",
    },
  },
});