import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'

// Firestore 컬렉션 구조 (평평하게 분리):
//   profiles/{uid}        - 사용자 프로필 (role, classId)
//   classes/{classId}     - 학급 (joinCode, teacherId)
//   lists/{listId}        - 보드 컬럼 (classId + boardOwnerId로 어느 보드 소속인지 구분)
//   cards/{cardId}        - 카드 (listId 소속, status: draft|published)
//
// boardOwnerId 규칙: 공지 보드는 teacherId, 학생 개인 보드는 해당 학생의 uid.

// ---------- profiles ----------

export function subscribeProfile(uid, cb) {
  return onSnapshot(doc(db, 'profiles', uid), (snap) => {
    cb(snap.exists() ? snap.data() : null)
  })
}

export async function ensureProfile(uid, defaults) {
  const ref = doc(db, 'profiles', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      classId: null,
      createdAt: serverTimestamp(),
      ...defaults,
    })
  }
}

export function subscribeStudentsInClass(classId, cb) {
  const q = query(
    collection(db, 'profiles'),
    where('classId', '==', classId),
    where('role', '==', 'student')
  )
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data())))
}

// ---------- classes ----------

function generateJoinCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // 혼동되는 0/O/1/I 제외
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export async function createClass(teacherId, name) {
  const joinCode = generateJoinCode()
  const classRef = doc(collection(db, 'classes'))
  await setDoc(classRef, {
    name,
    joinCode,
    teacherId,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'profiles', teacherId), { classId: classRef.id })
  await addDoc(collection(db, 'lists'), {
    classId: classRef.id,
    boardOwnerId: teacherId,
    title: '공지사항',
    order: Date.now(),
    createdAt: serverTimestamp(),
  })
  return { classId: classRef.id, joinCode }
}

export async function joinClassByCode(studentId, code) {
  const normalized = code.trim().toUpperCase()
  const q = query(collection(db, 'classes'), where('joinCode', '==', normalized))
  const snap = await getDocs(q)
  if (snap.empty) return { ok: false, error: 'not-found' }

  const classDoc = snap.docs[0]
  await updateDoc(doc(db, 'profiles', studentId), { classId: classDoc.id })

  const defaultLists = ['할 일', '진행 중', '완료']
  await Promise.all(
    defaultLists.map((title, i) =>
      addDoc(collection(db, 'lists'), {
        classId: classDoc.id,
        boardOwnerId: studentId,
        title,
        order: Date.now() + i,
        createdAt: serverTimestamp(),
      })
    )
  )
  return { ok: true, classId: classDoc.id }
}

export function subscribeClass(classId, cb) {
  return onSnapshot(doc(db, 'classes', classId), (snap) => {
    cb(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  })
}

// ---------- lists ----------

export function subscribeLists(classId, boardOwnerId, cb) {
  const q = query(
    collection(db, 'lists'),
    where('classId', '==', classId),
    where('boardOwnerId', '==', boardOwnerId)
  )
  return onSnapshot(q, (snap) => {
    const lists = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    lists.sort((a, b) => a.order - b.order)
    cb(lists)
  })
}

export async function addList(classId, boardOwnerId, title) {
  await addDoc(collection(db, 'lists'), {
    classId,
    boardOwnerId,
    title,
    order: Date.now(),
    createdAt: serverTimestamp(),
  })
}

export async function deleteList(listId) {
  const q = query(collection(db, 'cards'), where('listId', '==', listId))
  const snap = await getDocs(q)
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
  await deleteDoc(doc(db, 'lists', listId))
}

// ---------- cards ----------

export function subscribeCards(classId, boardOwnerId, cb) {
  const q = query(
    collection(db, 'cards'),
    where('classId', '==', classId),
    where('boardOwnerId', '==', boardOwnerId)
  )
  return onSnapshot(q, (snap) => {
    const cards = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    cards.sort((a, b) => a.order - b.order)
    cb(cards)
  })
}

export async function addCard(listId, classId, boardOwnerId, authorId, title) {
  await addDoc(collection(db, 'cards'), {
    listId,
    classId,
    boardOwnerId,
    authorId,
    title,
    content: '',
    status: 'draft',
    order: Date.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateCard(cardId, patch) {
  await updateDoc(doc(db, 'cards', cardId), { ...patch, updatedAt: serverTimestamp() })
}

export async function deleteCard(cardId) {
  await deleteDoc(doc(db, 'cards', cardId))
}

export async function moveCard(cardId, newListId, newOrder) {
  await updateDoc(doc(db, 'cards', cardId), {
    listId: newListId,
    order: newOrder,
    updatedAt: serverTimestamp(),
  })
}

export async function toggleCardStatus(cardId, currentStatus) {
  await updateCard(cardId, { status: currentStatus === 'published' ? 'draft' : 'published' })
}
