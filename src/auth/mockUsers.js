// 로그인 화면 없이 실습을 반복할 수 있도록 미리 고정해 둔 목업 사용자 목록.
// 실제 Firebase Auth 연동 시에는 이 파일과 useCurrentUser의 내부 구현만 교체하면 된다.
export const MOCK_USERS = [
  { uid: 'mock-teacher-1', displayName: '김선생', role: 'teacher' },
  { uid: 'mock-student-1', displayName: '학생 A', role: 'student' },
  { uid: 'mock-student-2', displayName: '학생 B', role: 'student' },
]

export const DEFAULT_MOCK_UID = MOCK_USERS[0].uid
