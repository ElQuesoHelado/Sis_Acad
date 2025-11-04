/**
 * @file Defines domain-specific validation errors for Value Objects.
 */

import { DomainError } from "./base/error.base.js";

/** Thrown when a string does not meet the email format. */
export class InvalidEmailError extends DomainError {
  constructor(message: string = "Invalid email format.") {
    super(message);
  }
}

/** Thrown when the email is an empty string. */
export class EmptyEmailError extends DomainError {
  constructor(message: string = "Email cannot be empty.") {
    super(message);
  }
}

/** Thrown when the input cannot be coerced to a Date. */
export class InvalidBirthdateError extends DomainError {
  constructor(message: string = "Invalid birthdate format.") {
    super(message);
  }
}

/** Thrown when the birthdate is in the future. */
export class FutureBirthdateError extends DomainError {
  constructor(message: string = "Birthdate cannot be in the future.") {
    super(message);
  }
}

/** Thrown when the time does not match the HH:MM format. */
export class InvalidTimeFormatError extends DomainError {
  constructor(
    message: string = 'Time must be in HH:MM format (e.g., "14:30").',
  ) {
    super(message);
  }
}

/** Thrown when the end time is not after the start time. */
export class InvalidTimeSlotError extends DomainError {
  constructor(message: string = "End time must be after start time.") {
    super(message);
  }
}

/** Thrown when the day of the week is not a valid enum value. */
export class InvalidDayOfWeekError extends DomainError {
  constructor(message: string = "Invalid day of the week.") {
    super(message);
  }
}

/** Thrown when a name or surname does not comply with rules (e.g., too short). */
export class InvalidNameError extends DomainError {
  constructor(message: string = "Invalid name.") {
    super(message);
  }
}

/** Thrown when the password hash is empty. */
export class InvalidPasswordError extends DomainError {
  constructor(message: string = "Password cannot be empty.") {
    super(message);
  }
}

/** Thrown when an ID does not comply with the UUID format. */
export class InvalidUuidError extends DomainError {
  constructor(message: string = "ID must be a valid UUID.") {
    super(message);
  }
}

/** Thrown when a student code does not meet the required format. */
export class InvalidStudentCodeError extends DomainError {
  constructor(message: string = "Invalid student code.") {
    super(message);
  }
}
/** Thrown when the number of credits is invalid (e.g., not positive). */
export class InvalidCreditsError extends DomainError {
  constructor(message: string = "Invalid number of credits.") {
    super(message);
  }
}

/** Thrown when a course code does not match the required format. */
export class InvalidCourseCodeError extends DomainError {
  constructor(message: string = "Invalid course code format.") {
    super(message);
  }
}

/** Thrown when an academic semester does not match the format YYYY-I or YYYY-II. */
export class InvalidSemesterError extends DomainError {
  constructor(message: string = "Invalid academic semester format.") {
    super(message);
  }
}

/** Thrown when a number is not a valid percentage (0-100). */
export class InvalidPercentageError extends DomainError {
  constructor(message: string = "Invalid percentage.") {
    super(message);
  }
}

/** Thrown when a course name or department is invalid. */
export class InvalidCourseNameError extends DomainError {
  constructor(message: string = "Invalid course name or department.") {
    super(message);
  }
}

/**
 * Thrown when a grade score is invalid (e.g., not between 0 and 20).
 */
export class InvalidScoreError extends DomainError {
  constructor(message: string = "Score must be a number between 0 and 20.") {
    super(message);
  }
}

/**
 * Thrown when a group letter (e.g., "A", "B", etc.) is invalid.
 */
export class InvalidGroupLetterError extends DomainError {
  /**
   * @param message - A descriptive message about why the group letter is invalid.
   */
  constructor(message: string = "The group letter is invalid.") {
    super(message);
  }
}
