'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAuditAction } from '@/lib/audit'

export async function updateRecipe(id: string, formData: any) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('recipes')
    .update({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      time: formData.time,
      calories: formData.calories,
      servings: formData.servings,
      ingredients: formData.ingredients,
      steps: formData.steps,
    })
    .eq('id', id)

  if (error) {
    console.error('Update Recipe Error:', error);
    throw new Error('Failed to update recipe: ' + error.message)
  }

  await logAuditAction('UPDATE_RECIPE', 'RECIPE', id, {
    updated_fields: Object.keys(formData)
  })

  revalidatePath('/recipes')
  revalidatePath(`/recipes/${id}`)
  return { success: true }
}

export async function deleteRecipe(id: string) {
    const supabase = await createClient()
    
    // Get recipe details first for log
    const { data: recipe } = await supabase.from('recipes').select('title').eq('id', id).single();

    const { error } = await supabase.from('recipes').delete().eq('id', id)
    if (error) {
        throw new Error('Failed to delete recipe: ' + error.message)
    }

    await logAuditAction('DELETE_RECIPE', 'RECIPE', id, { title: recipe?.title })
    
    revalidatePath('/recipes')
    return { success: true }
}
