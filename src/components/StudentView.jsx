import { useEffect, useState } from 'react'
import { subscribeClass } from '../data/firestoreApi'
import Board from './Board'

export default function StudentView({ user }) {
  const [tab, setTab] = useState('mine')
  const [classInfo, setClassInfo] = useState(null)

  useEffect(() => subscribeClass(user.classId, setClassInfo), [user.classId])

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>{classInfo?.name ?? '학급'}</h1>
      </div>

      <div className="tabs">
        <button className={tab === 'mine' ? 'active' : ''} onClick={() => setTab('mine')}>
          내 보드
        </button>
        <button className={tab === 'announcement' ? 'active' : ''} onClick={() => setTab('announcement')}>
          공지
        </button>
      </div>

      {tab === 'mine' && (
        <Board
          classId={user.classId}
          boardOwnerId={user.uid}
          authorId={user.uid}
          editable
          visibleStatuses={['draft', 'published']}
          showStatusToggle
          publishLabel="선생님에게 공개"
          unpublishLabel="나만 보기로 전환"
        />
      )}

      {tab === 'announcement' && classInfo && (
        <Board
          classId={user.classId}
          boardOwnerId={classInfo.teacherId}
          editable={false}
          visibleStatuses={['published']}
          showStatusToggle={false}
        />
      )}
    </div>
  )
}
