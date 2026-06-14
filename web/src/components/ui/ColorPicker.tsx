// region imports
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { Input } from './Input'
import type { ColorPickerProps } from '@/types'
// endregion

// region constants
const PRESET_COLORS = [
  '#0EA5E9', // sky
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#F43F5E', // rose
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#10B981', // emerald
  '#06B6D4', // cyan
  '#0891B2', // cyan-dark
  '#000000', // black
]
// endregion

// region component
export const ColorPicker = ({ value, onChange, label = 'Color' }: ColorPickerProps) => {
  // region state
  const [showPicker, setShowPicker] = useState(false)
  // endregion

  // region handlers

  // only propagate valid hex values from the text input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val) || val === '') {
      onChange(val)
    }
  }

  // endregion

  // region render
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">{label}</label>

      <div className="flex gap-3">
        {/* hex text input */}
        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder="#000000"
          maxLength={7}
          className="flex-1"
        />

        {/* native colour input for visual picking */}
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 rounded-lg border border-neutral-300 cursor-pointer"
        />

        {/* toggle preset swatch grid */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Presets
        </button>
      </div>

      {/* preset colour swatches */}
      {showPicker && (
        <div className="grid grid-cols-6 gap-2 rounded-lg bg-neutral-50 p-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => {
                onChange(color)
                setShowPicker(false)
              }}
              className={cn(
                'h-8 rounded-lg border-2 transition-all',
                value === color ? 'border-neutral-900 shadow-md' : 'border-transparent hover:shadow-md',
              )}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      )}
    </div>
  )
  // endregion
}
// endregion
