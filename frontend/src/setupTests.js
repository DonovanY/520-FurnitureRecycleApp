import "@testing-library/jest-dom";

Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
  configurable: true,
  writable: true,
  value: jest.fn(),
});