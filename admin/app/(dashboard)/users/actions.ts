'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/lib/audit'

export async function updateUser(id: string, formData: any) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      name: formData.name,
      chef_level: formData.chef_level,
      xp: formData.xp,
      bio: formData.bio,
      stats: formData.stats,
      badges: formData.badges,
    })
    .eq('id', id)

  if (error) {
    throw new Error('Failed to update user: ' + error.message)
  }

  await logAuditAction('UPDATE_USER', 'USER', id, {
    updated_fields: Object.keys(formData)
  })

  revalidatePath('/users')
  revalidatePath(`/users/${id}`)
  return { success: true }
}
