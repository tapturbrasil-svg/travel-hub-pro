import React from 'react'

type Cell = {
  id: string
  label?: string
  filled?: boolean
  color?: string
}

type Props = {
  rows: number
  cols: number
  cells?: Cell[]
}

export function LayoutBoard({ rows, cols, cells }: Props) {
  const total = rows * cols
  const gridCells = (cells && cells.length >= total) ? cells : Array.from({ length: total }).map((_, i) => ({ id: `cell-${i}`, label: String(i+1), filled: false }))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8, padding: 16 }}>
      {gridCells.map((cell) => {
        const color = cell.filled ? '#34D399' : '#FFFFFF'
        return (
          <div key={cell.id} style={{ height: 72, borderRadius: 8, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', background: color }}>
            <span style={{ fontSize: 12, color: '#374151' }}>{cell.label ?? ''}</span>
          </div>
        )
      })}
    </div>
  )
}

export default LayoutBoard
