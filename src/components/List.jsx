import { useState } from 'react'
import Card from './Card'

export default function List({
  list,
  cards,
  editable,
  showStatusToggle,
  publishLabel,
  unpublishLabel,
  onAddCard,
  onDeleteList,
  onDeleteCard,
  onSaveCard,
  onToggleStatus,
  onDropCard,
}) {
  const [newTitle, setNewTitle] = useState('')

  function handleAdd(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    onAddCard(newTitle.trim())
    setNewTitle('')
  }

  function computeOrderBefore(beforeCardId) {
    const idx = cards.findIndex((c) => c.id === beforeCardId)
    const currOrder = cards[idx].order
    const prevOrder = idx > 0 ? cards[idx - 1].order : currOrder - 1000
    return (prevOrder + currOrder) / 2
  }

  function handleListDrop(e) {
    if (!editable) return
    e.preventDefault()
    const draggedId = e.dataTransfer.getData('text/plain')
    if (!draggedId) return
    const lastOrder = cards.length ? cards[cards.length - 1].order : Date.now()
    onDropCard(draggedId, list.id, lastOrder + 1000)
  }

  return (
    <div className="list" onDragOver={(e) => editable && e.preventDefault()} onDrop={handleListDrop}>
      <div className="list__header">
        <span>{list.title}</span>
        {editable && (
          <button className="list__delete" onClick={onDeleteList} title="리스트 삭제">
            ×
          </button>
        )}
      </div>
      <div className="list__cards">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            editable={editable}
            showStatusToggle={showStatusToggle}
            publishLabel={publishLabel}
            unpublishLabel={unpublishLabel}
            onToggleStatus={() => onToggleStatus(card)}
            onDelete={() => onDeleteCard(card.id)}
            onSave={(patch) => onSaveCard(card.id, patch)}
            onDropBefore={(draggedId) => onDropCard(draggedId, list.id, computeOrderBefore(card.id))}
          />
        ))}
      </div>
      {editable && (
        <form className="list__add" onSubmit={handleAdd}>
          <input
            placeholder="+ 카드 추가"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        </form>
      )}
    </div>
  )
}
