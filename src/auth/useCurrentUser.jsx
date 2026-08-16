import { createContext, useContext, useEffect, useState } from 'react'
import { isFirebaseConfigured } from '../firebase'
import { ensureProfile, subscribeProfile } from '../data/firestoreApi'
import { DEFAULT_MOCK_UID, MOCK_USERS } from './mockUsers'

// 실제 Firebase Auth 연동 시 이 파일의 내부 구현만 교체하면 된다.
// 바깥에서 쓰는 인터페이스는 useCurrentUser() -> { user, loading } 로 고정.

const CurrentUserContext = createContext(null)

export function CurrentUserProvider({ children }) {
  const [activeUid, setActiveUid] = useState(DEFAULT_MOCK_UID)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)

  const persona = MOCK_USERS.find((u) => u.uid === activeUid)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }
    let unsubscribe = () => {}
    let cancelled = false
    setLoading(true)
    setProfile(null)

    ensureProfile(persona.uid, {
      displayName: persona.displayName,
      role: persona.role,
    }).then(() => {
      if (cancelled) return
      unsubscribe = subscribeProfile(persona.uid, (data) => {
        setProfile(data)
        setLoading(false)
      })
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [activeUid])

  const currentUser = isFirebaseConfigured
    ? profile && { ...persona, ...profile }
    : { ...persona, classId: null }

  const value = {
    currentUser,
    loading,
    activeUid,
    switchUser: setActiveUid,
    mockUsers: MOCK_USERS,
  }

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}

function useProviderValue(hookName) {
  const ctx = useContext(CurrentUserContext)
  if (!ctx) throw new Error(`${hookName} must be used within CurrentUserProvider`)
  return ctx
}

// 실제 Firebase Auth 버전에서도 그대로 유지될 훅.
export function useCurrentUser() {
  const ctx = useProviderValue('useCurrentUser')
  return { user: ctx.currentUser, loading: ctx.loading }
}

// 목업 전용: 로그인 화면 대신 사용자를 전환하는 개발용 훅. 실 Auth 연동 시 삭제 대상.
export function useMockUserSwitcher() {
  const ctx = useProviderValue('useMockUserSwitcher')
  return { mockUsers: ctx.mockUsers, activeUid: ctx.activeUid, switchUser: ctx.switchUser }
}
