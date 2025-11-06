import type { Id } from "@/domain/value-objects/index.js";
import { ClassType } from "@/domain/enums/index.js";
import {
  type ITheoryGroupRepository,
  type ILabGroupRepository,
} from "@/domain/repositories/index.js";
import { NotAuthorizedError } from "@/application/errors/not-authorized.error.js";

/**
 * Service to centralize teacher authorization logic.
 * Can be reused across multiple use cases (attendance, grading, roster, etc.).
 */
export class TeacherAuthorizationService {
  /**
   * Ensures that the given teacher is the owner of the specified group.
   * Works with either transactional or non-transactional repositories.
   *
   * @param teacherId - The teacher's user ID as a value object.
   * @param groupId - The group ID (theory or lab) to authorize against.
   * @param classType - Indicates whether this is a THEORY or LAB group.
   * @param theoryGroupRepo - Repository for theory groups.
   * @param labGroupRepo - Repository for lab groups.
   *
   * @throws NotAuthorizedError if the teacher is not the owner of the group.
   */
  public async authorizeTeacherForGroup(
    teacherId: Id,
    groupId: Id,
    classType: ClassType,
    theoryGroupRepo: ITheoryGroupRepository,
    labGroupRepo: ILabGroupRepository,
  ): Promise<void> {
    let groupOwnerId: Id | null = null;

    if (classType === ClassType.THEORY) {
      const group = await theoryGroupRepo.findById(groupId);
      groupOwnerId = group?.professorId ?? null;
    } else {
      const group = await labGroupRepo.findById(groupId);
      groupOwnerId = group?.professorId ?? null;
    }

    if (!groupOwnerId || !groupOwnerId.equals(teacherId)) {
      throw new NotAuthorizedError("No eres profesor de este grupo.");
    }
  }
}
