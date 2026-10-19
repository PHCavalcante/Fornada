export type UserRole = 'customer' | 'owner' | 'admin'
export type SelfAssignableRole = Extract<UserRole, 'customer' | 'owner'>

export type ProfileUpdate = Partial<Pick<Profile, 'full_name' | 'phone' | 'avatar_url'>>

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}
