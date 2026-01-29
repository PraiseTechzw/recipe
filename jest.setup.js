// Mock Expo modules
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(() => "test-uuid-1234"),
}));

jest.mock("expo-haptics", () => ({
  ImpactFeedbackStyle: {},
  NotificationFeedbackType: {},
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

jest.mock("expo-file-system", () => ({
  documentDirectory: "file:///test-directory/",
  readAsStringAsync: jest.fn(() => Promise.resolve("base64-content")),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true })),
  makeDirectoryAsync: jest.fn(),
}));
jest.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file:///test-directory/",
  readAsStringAsync: jest.fn(() => Promise.resolve("base64-content")),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true })),
  makeDirectoryAsync: jest.fn(),
}));

jest.mock("expo-camera", () => ({
  Camera: {
    Constants: {
      Type: { back: "back", front: "front" },
    },
  },
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock Supabase if used directly (though we are testing offline-first mostly)
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() =>
        Promise.resolve({ data: { session: null }, error: null }),
      ),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(),
        })),
      })),
    })),
  })),
}));

// Mock global useStore to avoid persistent state issues if needed
// But usually we mock it per test file if we want to isolate
