/**
 * @file Defines the CourseContent entity (a syllabus topic).
 */

import { z } from "zod";
import { Entity } from "./base/entity.base.js";
import { Id } from "../value-objects/index.js";
import { TopicStatus } from "../enums/topic-status.enum.js";
import { DomainError } from "../errors/base/error.base.js";
import {
  CourseContentCreationError,
  InvalidTopicStatusError,
} from "../errors/course-content.errors.js";

// Internal validation schemas
const TopicNameSchema = z.string().trim().min(5);
const WeekSchema = z.number().int().min(1).max(18);

export interface CourseContentCreateProps {
  id: string; // Unique topic ID
  theoryGroupId: string; // Linked to the theory group, NOT the course
  week: number;
  topicName: string;
  status: TopicStatus;
}

interface CourseContentProps {
  id: Id;
  theoryGroupId: Id;
  week: number;
  topicName: string;
  status: TopicStatus;
}

/**
 * Represents a single syllabus topic of a TheoryGroup.
 * @extends Entity
 */
export class CourseContent extends Entity {
  public readonly theoryGroupId: Id;
  public week: number;
  public topicName: string;
  public status: TopicStatus;

  private constructor(props: CourseContentProps) {
    super(props.id);
    this.theoryGroupId = props.theoryGroupId;
    this.week = props.week;
    this.topicName = props.topicName;
    this.status = props.status;
  }

  /**
   * Factory method to create a new CourseContent instance.
   * @param props - Properties for the new topic.
   * @returns A new CourseContent entity.
   * @throws CourseContentCreationError | InvalidTopicStatusError | ZodError
   */
  public static create(props: CourseContentCreateProps): CourseContent {
    try {
      // Validate status
      if (!Object.values(TopicStatus).includes(props.status)) {
        throw new InvalidTopicStatusError(props.status);
      }

      // Validate other fields
      const topicName = TopicNameSchema.parse(props.topicName);
      const week = WeekSchema.parse(props.week);

      return new CourseContent({
        id: Id.create(props.id),
        theoryGroupId: Id.create(props.theoryGroupId),
        week,
        topicName,
        status: props.status,
      });
    } catch (error) {
      if (error instanceof DomainError || error instanceof z.ZodError) {
        throw error;
      }
      throw new CourseContentCreationError(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Marks this topic as pending.
   */
  public markAsPending(): void {
    this.status = TopicStatus.PENDING;
  }

  /**
   * Marks this topic as completed.
   */
  public markAsCompleted(): void {
    this.status = TopicStatus.COMPLETED;
  }
}
