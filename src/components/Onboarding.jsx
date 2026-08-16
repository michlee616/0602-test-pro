import { useState } from 'react'
import { createClass, joinClassByCode } from '../data/firestoreApi'
import { isFirebaseConfigured } from '../firebase'

export default function Onboarding({ user }) {
  const [className, setClassName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [createdCode, setCreatedCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleCreateClass(e) {
    e.preventDefault()
    if (!className.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      const { joinCode: code } = await createClass(user.uid, className.trim())
      setCreatedCode(code)
    } catch (err) {
      setError('학급 생성에 실패했습니다: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!joinCode.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      const res = await joinClassByCode(user.uid, joinCode)
      if (!res.ok) setError('가입 코드를 찾을 수 없습니다. 코드를 다시 확인해 주세요.')
    } catch (err) {
      setError('참여에 실패했습니다: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  if (user.role === 'teacher') {
    return (
      <div className="onboarding">
        <h2>학급 만들기</h2>
        <p className="onboarding__desc">학급을 만들면 가입 코드가 발급됩니다. 이 코드를 학생에게 공유하세요.</p>
        <form onSubmit={handleCreateClass}>
          <input
            placeholder="학급 이름 (예: 3학년 2반)"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            disabled={!isFirebaseConfigured}
          />
          <button type="submit" disabled={busy || !isFirebaseConfigured}>학급 만들기</button>
        </form>
        {createdCode && (
          <p className="onboarding__code">
            생성 완료! 가입 코드는 <strong>{createdCode}</strong> 입니다. (학급 화면 상단에서 언제든 다시 확인할 수 있어요)
          </p>
        )}
        {error && <p className="onboarding__error">{error}</p>}
      </div>
    )
  }

  return (
    <div className="onboarding">
      <h2>학급 참여하기</h2>
      <p className="onboarding__desc">선생님께 받은 가입 코드를 입력하세요.</p>
      <form onSubmit={handleJoin}>
        <input
          placeholder="가입 코드 6자리"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          maxLength={6}
          disabled={!isFirebaseConfigured}
        />
        <button type="submit" disabled={busy || !isFirebaseConfigured}>참여하기</button>
      </form>
      {error && <p className="onboarding__error">{error}</p>}
    </div>
  )
}
