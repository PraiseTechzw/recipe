"use client";

import { deleteRecipe, updateRecipe } from "@/app/(dashboard)/recipes/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface RecipeFormProps {
  initialData: any;
}

export function RecipeForm({ initialData }: RecipeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    category: initialData.category || "",
    time: initialData.time || "",
    calories: initialData.calories || "",
    servings: initialData.servings || 1,
    ingredients: JSON.stringify(initialData.ingredients || [], null, 2),
    steps: JSON.stringify(initialData.steps || [], null, 2),
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate JSON
      let parsedIngredients;
      let parsedSteps;
      try {
        parsedIngredients = JSON.parse(formData.ingredients);
        parsedSteps = JSON.parse(formData.steps);
      } catch (e) {
        alert("Invalid JSON in Ingredients or Steps field");
        setIsLoading(false);
        return;
      }

      await updateRecipe(initialData.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        time: formData.time,
        calories: formData.calories,
        servings: parseInt(String(formData.servings)),
        ingredients: parsedIngredients,
        steps: parsedSteps,
      });

      router.push("/recipes");
      router.refresh();
    } catch (error) {
      console.error("Error updating recipe:", error);
      alert("Failed to update recipe");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this recipe? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteRecipe(initialData.id);

      router.push("/recipes");
      router.refresh();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Failed to delete recipe");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-4xl"
    >
      <div className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
              <option value="Dessert">Dessert</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="servings"
              className="block text-sm font-medium text-gray-700"
            >
              Servings
            </label>
            <input
              type="number"
              id="servings"
              name="servings"
              value={formData.servings}
              onChange={handleChange}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="time"
              className="block text-sm font-medium text-gray-700"
            >
              Time (e.g. "30 min")
            </label>
            <input
              type="text"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border"
            />
          </div>

          <div>
            <label
              htmlFor="calories"
              className="block text-sm font-medium text-gray-700"
            >
              Calories (e.g. "500 Kcal")
            </label>
            <input
              type="text"
              id="calories"
              name="calories"
              value={formData.calories}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="ingredients"
            className="block text-sm font-medium text-gray-700"
          >
            Ingredients (JSON)
          </label>
          <textarea
            id="ingredients"
            name="ingredients"
            rows={10}
            value={formData.ingredients}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border font-mono text-xs"
          />
          <p className="mt-1 text-xs text-gray-500">
            Edit ingredients structure as JSON.
          </p>
        </div>

        <div>
          <label
            htmlFor="steps"
            className="block text-sm font-medium text-gray-700"
          >
            Steps (JSON)
          </label>
          <textarea
            id="steps"
            name="steps"
            rows={10}
            value={formData.steps}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border font-mono text-xs"
          />
          <p className="mt-1 text-xs text-gray-500">
            Edit cooking steps as JSON.
          </p>
        </div>

        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Delete Recipe"}
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
