import { useCurrentUser } from './auth/useCurrentUser'
import { isFirebaseConfigured } from './firebase'
import UserSwitcher from './components/UserSwitcher'
import FirebaseSetupBanner from './components/FirebaseSetupBanner'
import Onboarding from './components/Onboarding'
import TeacherView from './components/TeacherView'
import StudentView from './components/StudentView'

export default function App() {
  const { user, loading } = useCurrentUser()

  return (
    <div className="app">
      <header className="app__topbar">
        <span className="app__logo">수업용 칸반보드</span>
        <UserSwitcher />
      </header>

      {!isFirebaseConfigured && <FirebaseSetupBanner />}

      <main className="app__main">
        {loading && <p className="app__loading">불러오는 중…</p>}
        {!loading && user && !user.classId && <Onboarding user={user} />}
        {!loading && user?.classId && user.role === 'teacher' && <TeacherView user={user} />}
        {!loading && user?.classId && user.role === 'student' && <StudentView user={user} />}
      </main>
    </div>
  )
}
