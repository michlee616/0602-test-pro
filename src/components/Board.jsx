import { useEffect, useState } from 'react'
import {
  addCard,
  addList,
  deleteCard,
  deleteList,
  moveCard,
  subscribeCards,
  subscribeLists,
  toggleCardStatus,
  updateCard,
} from '../data/firestoreApi'
import List from './List'

export default function Board({
  classId,
  boardOwnerId,
  authorId,
  editable,
  visibleStatuses,
  showStatusToggle,
  publishLabel,
  unpublishLabel,
}) {
  const [lists, setLists] = useState([])
  const [cards, setCards] = useState([])
  const [newListTitle, setNewListTitle] = useState('')

  useEffect(() => {
    const unsubLists = subscribeLists(classId, boardOwnerId, setLists)
    const unsubCards = subscribeCards(classId, boardOwnerId, setCards)
    return () => {
      unsubLists()
      unsubCards()
    }
  }, [classId, boardOwnerId])

  const visibleCards = cards.filter((c) => visibleStatuses.includes(c.status))

  function handleAddList(e) {
    e.preventDefault()
    if (!newListTitle.trim()) return
    addList(classId, boardOwnerId, newListTitle.trim())
    setNewListTitle('')
  }

  if (lists.length === 0) {
    return (
      <div className="board">
        {editable ? (
          <form className="board__add-list board__add-list--empty" onSubmit={handleAddList}>
            <input
              placeholder="+ 리스트 추가"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
            />
          </form>
        ) : (
          <p className="board__empty">아직 카드가 없습니다.</p>
        )}
      </div>
    )
  }

  return (
    <div className="board">
      {lists.map((list) => (
        <List
          key={list.id}
          list={list}
          cards={visibleCards.filter((c) => c.listId === list.id)}
          editable={editable}
          showStatusToggle={showStatusToggle}
          publishLabel={publishLabel}
          unpublishLabel={unpublishLabel}
          onAddCard={(title) => addCard(list.id, classId, boardOwnerId, authorId, title)}
          onDeleteList={() => deleteList(list.id)}
          onDeleteCard={(cardId) => deleteCard(cardId)}
          onSaveCard={(cardId, patch) => updateCard(cardId, patch)}
          onToggleStatus={(card) => toggleCardStatus(card.id, card.status)}
          onDropCard={(cardId, newListId, newOrder) => moveCard(cardId, newListId, newOrder)}
        />
      ))}
      {editable && (
        <form className="board__add-list" onSubmit={handleAddList}>
          <input
            placeholder="+ 리스트 추가"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
          />
        </form>
      )}
    </div>
  )
}
