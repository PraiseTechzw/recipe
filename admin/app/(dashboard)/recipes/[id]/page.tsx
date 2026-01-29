import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { RecipeForm } from "@/components/RecipeForm";

async function getRecipe(id: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
      console.error("Error fetching recipe:", error);
      return null;
  }
  return data;
}

export default async function EditRecipePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
      redirect('/recipes');
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Recipe</h1>
      <RecipeForm initialData={recipe} />
    </div>
  );
}
