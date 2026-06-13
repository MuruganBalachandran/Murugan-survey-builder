import { Input } from '@/components/ui/Input'
import { BRAND_SWATCHES } from '@/utils/constants'
import type { SurveyBrandingStepProps } from '@/types'

const brandSwatches = BRAND_SWATCHES

export const SurveyBrandingStep = ({
  primaryColor,
  logoUrl,
  logoFileName,
  onColorChange,
  onLogoUrlChange,
  onLogoUpload,
  onLogoUrlBlur,
}: SurveyBrandingStepProps) => (
  <div className="space-y-5">
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-600">Primary color</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={primaryColor}
          onChange={(event) => onColorChange(event.target.value)}
          className="h-12 w-12 cursor-pointer rounded-xl border border-gray-200 bg-white"
          aria-label="Pick primary color"
          title="Pick primary color"
        />
        <span className="text-sm font-medium text-gray-700">{primaryColor}</span>
      </div>
    </div>

    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-600">Preset colors</label>
      <div className="grid grid-cols-6 gap-3 sm:grid-cols-12">
        {brandSwatches.map((swatch) => (
          <button
            key={swatch}
            type="button"
            onClick={() => onColorChange(swatch)}
            className={`h-10 w-10 rounded-full border transition-all ${
              primaryColor.toLowerCase() === swatch.toLowerCase()
                ? 'border-violet-600 ring-2 ring-violet-200'
                : 'border-gray-200 hover:border-violet-300'
            }`}
            style={{ backgroundColor: swatch }}
            aria-label={`Choose color ${swatch}`}
            title={swatch}
          />
        ))}
      </div>
    </div>

    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-600">
        Logo upload
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => onLogoUpload(event.target.files?.[0] ?? null)}
        className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-violet-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
      />
      {logoFileName && <p className="mt-1.5 text-xs text-gray-500">Selected: {logoFileName}</p>}
    </div>

    <Input
      label="Logo URL"
      type="url"
      value={logoUrl}
      onChange={(event) => onLogoUrlChange(event.target.value)}
      onBlur={onLogoUrlBlur}
      placeholder="https://example.com/logo.png"
      hint="Uploading a file will convert it to a previewable data URL here."
    />

    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Preview</p>
      <div className="mt-3 flex items-center gap-3">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo preview" className="h-10 w-10 rounded-xl object-cover" />
        ) : (
          <span className="h-10 w-10 rounded-xl" style={{ backgroundColor: primaryColor }} />
        )}
        <div>
          <p className="font-semibold text-gray-900">{logoFileName || 'Brand preview'}</p>
          <p className="text-sm text-gray-600">The logo shown to respondents.</p>
        </div>
      </div>
    </div>
  </div>
)
