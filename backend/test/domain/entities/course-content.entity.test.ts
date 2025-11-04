import { describe, it, expect, vi, afterEach } from "vitest";
import {
  CourseContent,
  type CourseContentCreateProps,
} from "@/domain/entities/course-content.entity.js";
import { TopicStatus } from "@/domain/enums/topic-status.enum.js";
import { Id } from "@/domain/value-objects/index.js";
import {
  InvalidUuidError,
  CourseContentCreationError,
  InvalidTopicStatusError,
} from "@/domain/errors/index.js";
import { ZodError } from "zod";

describe("Domain > Entity: CourseContent", () => {
  const validProps: CourseContentCreateProps = {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    theoryGroupId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    week: 1,
    topicName: "Introducción al Curso y Sílabo",
    status: TopicStatus.PENDING,
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a valid CourseContent instance", () => {
    const content = CourseContent.create(validProps);

    expect(content).toBeInstanceOf(CourseContent);
    expect(content.id).toBeInstanceOf(Id);
    expect(content.theoryGroupId).toBeInstanceOf(Id);
    expect(content.week).toBe(1);
    expect(content.topicName).toBe("Introducción al Curso y Sílabo");
    expect(content.status).toBe(TopicStatus.PENDING);
  });

  it("should throw InvalidUuidError if theoryGroupId is invalid", () => {
    const invalidProps = { ...validProps, theoryGroupId: "123" };
    expect(() => CourseContent.create(invalidProps)).toThrow(InvalidUuidError);
  });

  it("should throw ZodError if week is invalid (0)", () => {
    const invalidProps = { ...validProps, week: 0 };
    expect(() => CourseContent.create(invalidProps)).toThrow(ZodError);
  });

  it("should throw ZodError if topicName is too short", () => {
    const invalidProps = { ...validProps, topicName: "Test" };
    expect(() => CourseContent.create(invalidProps)).toThrow(ZodError);
  });

  it("should throw InvalidTopicStatusError if status is invalid", () => {
    const invalidProps = { ...validProps, status: "FINALIZADO" as any };
    expect(() => CourseContent.create(invalidProps)).toThrow(
      InvalidTopicStatusError,
    );
  });

  it("should correctly update status", () => {
    const content = CourseContent.create(validProps);
    expect(content.status).toBe(TopicStatus.PENDING);

    content.markAsCompleted();
    expect(content.status).toBe(TopicStatus.COMPLETED);

    content.markAsPending();
    expect(content.status).toBe(TopicStatus.PENDING);
  });

  it("should wrap non-Domain/Zod errors in CourseContentCreationError", () => {
    const genericError = new Error("Error inesperado");
    vi.spyOn(Id, "create").mockImplementationOnce(() => {
      throw genericError;
    });

    expect(() => CourseContent.create(validProps)).toThrow(
      CourseContentCreationError,
    );
  });
});
