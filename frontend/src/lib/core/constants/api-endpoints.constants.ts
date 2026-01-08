/**
 * Centralized object for all application endpoints.
 * These are RELATIVE paths to `PUBLIC_API_URL`
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login'
  },
  STUDENT: {
    COURSES: (semester: string) => `/student/courses/${semester}`,
    GRADES: (semester: string) => `/student/grades/${semester}`,
    SCHEDULE: (semester: string) => `/student/schedule/${semester}`,
    AVAILABLE_LABS: (enrollmentId: string) => `/student/enrollment/${enrollmentId}/available-labs`,
    ENROLL_LAB: '/student/enroll-lab',
    ENROLL_LABS: '/student/enroll-labs'
  },
  TEACHER: {
    GROUPS: (semester: string) => `/teacher/groups/${semester}`,
    SCHEDULE: (semester: string) => `/teacher/schedule/${semester}`,
    ROSTER: (groupId: string) => `/teacher/group/${groupId}/roster`,
    ROSTER_WITH_GRADES: (groupId: string) => `/teacher/group/${groupId}/roster-with-grades`,
    SAVE_BULK_GRADES: '/teacher/grades/save-bulk',
    TAKE_ATTENDANCE: '/teacher/attendance/take',
    CREATE_RESERVATION: '/teacher/reservations/create'
  },
  ADMIN: {
    GET_USERS: '/admin/users',
    GET_TEACHER_DETAILS: (userId: string, semester: string) =>
      `/admin/teachers/${userId}/${semester}`,
    GET_STUDENT_DETAILS: (userId: string, semester: string) =>
      `/admin/students/${userId}/${semester}`,
    GET_CLASSROOM_SCHEDULE: (classroomId: string) => `/admin/classrooms/${classroomId}/schedule`
  },
  SECRETARY: {
    STUDENTS: '/secretary/students',
    TEACHERS: '/secretary/teachers',
    GET_TEACHER_DETAILS: (userId: string, semester: string) =>
      `/secretary/teachers/${userId}/${semester}`,
    GET_STUDENT_DETAILS: (userId: string, semester: string) =>
      `/secretary/students/${userId}/${semester}`,
    LABS: '/secretary/labs',
    UPDATE_LAB_CAPACITY: (labGroupId: string) => `/secretary/labs/${labGroupId}/capacity`,
    GET_LAB_STUDENTS: (labGroupId: string) => `/secretary/labs/${labGroupId}/students`,
    COURSES: '/secretary/courses',
    ENROLLMENT_PERIOD: '/secretary/enrollment-period'
  },
  USER: {
    PROFILE: () => '/user/profile'
  },
  CLASSROOMS: {
    GET_ALL: '/classrooms'
  }
};
