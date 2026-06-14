// region imports
import { Input } from '@/components/ui/Input'
import type { BrandingFormProps } from '@/types'
// endregion

// region component
export const BrandingForm = ({
  primaryColor,
  logoUrl,
  logoFileName,
  onColorChange,
  onLogoUrlChange,
  onLogoUpload,
}: BrandingFormProps) => (
  <div className="space-y-4">
    {/* color picker with hex readout */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={primaryColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-12 h-12 rounded-lg cursor-pointer"
        />
        <span className="text-sm text-gray-600">{primaryColor}</span>
      </div>
    </div>

    {/* file upload — converted to data URL by the parent handler */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Logo upload</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onLogoUpload(e.target.files?.[0] ?? null)}
        className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-violet-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
      />
      {logoFileName && <p className="mt-1.5 text-xs text-gray-500">Selected: {logoFileName}</p>}
    </div>

    {/* direct URL alternative to file upload */}
    <Input
      label="Logo URL (optional)"
      type="url"
      value={logoUrl}
      onChange={(e) => onLogoUrlChange(e.target.value)}
      placeholder="https://example.com/logo.png"
    />

    {/* live brand preview */}
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Brand preview</p>
      <div className="mt-3 flex items-center gap-3">
        {logoUrl ? (
          <img src={logoUrl} alt="Brand preview" className="h-10 w-10 rounded-xl object-cover" />
        ) : (
          <span className="h-10 w-10 rounded-xl" style={{ backgroundColor: primaryColor }} />
        )}
        <div>
          <p className="font-semibold text-gray-900">{logoFileName || 'Current brand'}</p>
          <p className="text-sm text-gray-600">The logo and color shown to respondents.</p>
        </div>
      </div>
    </div>
  </div>
)
// endregion
