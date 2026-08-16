import { useMockUserSwitcher } from '../auth/useCurrentUser'

export default function UserSwitcher() {
  const { mockUsers, activeUid, switchUser } = useMockUserSwitcher()

  return (
    <div className="user-switcher">
      <span className="user-switcher__label">테스트 사용자</span>
      <select value={activeUid} onChange={(e) => switchUser(e.target.value)}>
        {mockUsers.map((u) => (
          <option key={u.uid} value={u.uid}>
            {u.displayName} ({u.role === 'teacher' ? '교사' : '학생'})
          </option>
        ))}
      </select>
    </div>
  )
}
