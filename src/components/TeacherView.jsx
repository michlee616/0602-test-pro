import { useEffect, useState } from 'react'
import { subscribeClass, subscribeStudentsInClass } from '../data/firestoreApi'
import Board from './Board'

export default function TeacherView({ user }) {
  const [tab, setTab] = useState('announcement')
  const [classInfo, setClassInfo] = useState(null)
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')

  useEffect(() => subscribeClass(user.classId, setClassInfo), [user.classId])

  useEffect(
    () =>
      subscribeStudentsInClass(user.classId, (list) => {
        setStudents(list)
        setSelectedStudent((prev) => (list.some((s) => s.uid === prev) ? prev : list[0]?.uid ?? ''))
      }),
    [user.classId]
  )

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>{classInfo?.name ?? '학급'}</h1>
        {classInfo && (
          <span className="join-code">
            가입 코드: <strong>{classInfo.joinCode}</strong>
          </span>
        )}
      </div>

      <div className="tabs">
        <button className={tab === 'announcement' ? 'active' : ''} onClick={() => setTab('announcement')}>
          공지 보드
        </button>
        <button className={tab === 'students' ? 'active' : ''} onClick={() => setTab('students')}>
          학생 보드 보기
        </button>
      </div>

      {tab === 'announcement' && (
        <Board
          classId={user.classId}
          boardOwnerId={user.uid}
          authorId={user.uid}
          editable
          visibleStatuses={['draft', 'published']}
          showStatusToggle
          publishLabel="학생에게 공개"
          unpublishLabel="비공개로 전환"
        />
      )}

      {tab === 'students' &&
        (students.length === 0 ? (
          <p className="board__empty">아직 참여한 학생이 없습니다.</p>
        ) : (
          <div>
            <select
              className="student-picker"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              {students.map((s) => (
                <option key={s.uid} value={s.uid}>
                  {s.displayName}
                </option>
              ))}
            </select>
            {selectedStudent && (
              <Board
                classId={user.classId}
                boardOwnerId={selectedStudent}
                editable={false}
                visibleStatuses={['draft', 'published']}
                showStatusToggle={false}
              />
            )}
          </div>
        ))}
    </div>
  )
}
