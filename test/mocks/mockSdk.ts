import { vi } from "vitest";

const mockSdk: any = {
  app: {
    onConfigure: vi.fn(),
    getParameters: vi.fn().mockReturnValueOnce({}),
    setReady: vi.fn(),
    getCurrentState: vi.fn(),
  },
  ids: {
    app: "test-app",
  },
  field: {
    getValue: vi.fn().mockReturnValue(""),
    setValue: vi.fn(),
    onValueChanged: vi.fn(),
    getForLocale: vi.fn(),
    setInvalid: vi.fn(),
    removeValue: vi.fn(),
  },
  window: {
    startAutoResizer: vi.fn(),
    stopAutoResizer: vi.fn(),
    updateHeight: vi.fn(),
  },
};

export { mockSdk };
