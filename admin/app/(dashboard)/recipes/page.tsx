import { createClient } from "@/utils/supabase/server";

export const revalidate = 0;

async function getRecipes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*, profiles(name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
  return data || [];
}

export default async function RecipesPage() {
  const recipes = await getRecipes();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Recipes</h1>
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
          {recipes.length} Recipes
        </span>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recipes.map((recipe: any) => (
                <tr
                  key={recipe.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {recipe.image_url ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover shadow-sm"
                            src={recipe.image_url}
                            alt=""
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div
                          className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[200px]"
                          title={recipe.title}
                        >
                          {recipe.title}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                            {recipe.time}
                          </span>
                          <span>•</span>
                          <span>{recipe.calories}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {recipe.profiles?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {recipe.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1" title="Rating">
                        ⭐ {Number(recipe.rating || 0).toFixed(1)}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span title="Reviews">
                        💬 {recipe.reviews_count || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(recipe.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={`/recipes/${recipe.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
