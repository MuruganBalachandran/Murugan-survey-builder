import { Button } from '@/components/ui/Button'
import { CopyIcon } from '@/utils/icons'
import type { ShareSectionProps } from '@/types'

export const ShareSection = ({ slug, onCopyLink, disabled = false }: ShareSectionProps) => {
  const publicUrl = `${window.location.origin}/survey/${slug}`

  return (
    <div className="app-panel">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Sharing</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Public URL</label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={publicUrl}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50"
          />
          <Button onClick={onCopyLink} variant="secondary" icon={<CopyIcon />} disabled={disabled}>
            Copy
          </Button>
        </div>
        {disabled && <p className="mt-2 text-xs text-gray-500">Publish the survey before sharing the link.</p>}
      </div>
    </div>
  )
}
