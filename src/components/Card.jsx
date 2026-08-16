import { useState } from 'react'

export default function Card({
  card,
  editable,
  showStatusToggle,
  publishLabel,
  unpublishLabel,
  onToggleStatus,
  onDelete,
  onSave,
  onDropBefore,
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(card.title)
  const [content, setContent] = useState(card.content)

  function handleSave() {
    onSave({ title: title.trim() || card.title, content })
    setEditing(false)
  }

  function handleCancel() {
    setTitle(card.title)
    setContent(card.content)
    setEditing(false)
  }

  return (
    <div
      className={`card card--${card.status}`}
      draggable={editable && !editing}
      onDragStart={(e) => {
        if (!editable) return
        e.dataTransfer.setData('text/plain', card.id)
      }}
      onDragOver={(e) => editable && e.preventDefault()}
      onDrop={(e) => {
        if (!editable) return
        e.preventDefault()
        e.stopPropagation()
        const draggedId = e.dataTransfer.getData('text/plain')
        if (draggedId && draggedId !== card.id) onDropBefore(draggedId)
      }}
    >
      {editing ? (
        <div className="card__edit">
          <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="내용 (선택)"
          />
          <div className="card__actions">
            <button onClick={handleSave}>저장</button>
            <button onClick={handleCancel}>취소</button>
          </div>
        </div>
      ) : (
        <>
          <div className="card__title">{card.title}</div>
          {card.content && <div className="card__content">{card.content}</div>}
          {!editable && card.status === 'draft' && <span className="card__badge">작성중 (비공개)</span>}
          {editable && (
            <div className="card__actions">
              {showStatusToggle && (
                <button className="card__status-btn" onClick={onToggleStatus}>
                  {card.status === 'published' ? unpublishLabel : publishLabel}
                </button>
              )}
              <button onClick={() => setEditing(true)}>수정</button>
              <button onClick={onDelete}>삭제</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
