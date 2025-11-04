import { describe, it, expect, vi } from "vitest";
import { DomainError } from "@/domain/errors/base/error.base.js";

class TestError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

describe("Domain > Errors > DomainError Base Class", () => {
  it("should correctly set the message and name", () => {
    const errorMessage = "Este es un error de prueba";
    const error = new TestError(errorMessage);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(TestError);
    expect(error.message).toBe(errorMessage);
    expect(error.name).toBe("TestError");
  });

  it("should call Error.captureStackTrace if it exists", () => {
    const mockCaptureStackTrace = vi.spyOn(Error, "captureStackTrace");

    const error = new TestError("test");

    expect(mockCaptureStackTrace).toHaveBeenCalledOnce();
    expect(mockCaptureStackTrace).toHaveBeenCalledWith(
      error,
      error.constructor,
    );

    mockCaptureStackTrace.mockRestore();
  });

  it("should not crash if Error.captureStackTrace does not exist", () => {
    const realCaptureStackTrace = Error.captureStackTrace;
    Error.captureStackTrace = undefined as any;

    let error: TestError | undefined;

    expect(() => {
      error = new TestError("test");
    }).not.toThrow();

    expect(error).toBeInstanceOf(TestError);
    expect(error?.name).toBe("TestError");

    Error.captureStackTrace = realCaptureStackTrace;
  });
});
