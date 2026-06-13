// region generate id

export const generateId = (): string => {
// generate unique identifier
return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// endregion

// region generate slug

export const generateSlug = (title: string): string => {
// convert title into URL-friendly slug
const formattedTitle = title
.toLowerCase()
.trim()
.replace(/[^a-z0-9]+/g, '-')
.replace(/^-|-$/g, '')

// append random suffix for uniqueness
const uniqueSuffix = Math.random().toString(36).substring(2, 7)

return `${formattedTitle}-${uniqueSuffix}`
}

// endregion

// region generate user id

export const generateUserId = (): string => {
// generate unique user identifier
return `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// endregion
