"use client";

import { updateUser } from "@/app/(dashboard)/users/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UserFormProps {
  initialData: any;
}

export function UserForm({ initialData }: UserFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    chef_level: initialData.chef_level || "Beginner",
    xp: initialData.xp || 0,
    bio: initialData.bio || "",
    stats: JSON.stringify(initialData.stats || {}, null, 2),
    badges: JSON.stringify(initialData.badges || [], null, 2),
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
      let parsedStats;
      let parsedBadges;
      try {
        parsedStats = JSON.parse(formData.stats);
        parsedBadges = JSON.parse(formData.badges);
      } catch (e) {
        alert("Invalid JSON in Stats or Badges field");
        setIsLoading(false);
        return;
      }

      await updateUser(initialData.id, {
        name: formData.name,
        chef_level: formData.chef_level,
        xp: parseInt(String(formData.xp)),
        bio: formData.bio,
        stats: parsedStats,
        badges: parsedBadges,
      });

      router.push("/users");
      router.refresh();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            User ID
          </label>
          <input
            type="text"
            value={initialData.id}
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm p-2 border"
          />
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="chef_level"
              className="block text-sm font-medium text-gray-700"
            >
              Chef Level
            </label>
            <input
              type="text"
              id="chef_level"
              name="chef_level"
              value={formData.chef_level}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border"
            />
          </div>

          <div>
            <label
              htmlFor="xp"
              className="block text-sm font-medium text-gray-700"
            >
              XP
            </label>
            <input
              type="number"
              id="xp"
              name="xp"
              value={formData.xp}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700"
          >
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border"
          />
        </div>

        <div>
          <label
            htmlFor="stats"
            className="block text-sm font-medium text-gray-700"
          >
            Stats (JSON)
          </label>
          <textarea
            id="stats"
            name="stats"
            rows={5}
            value={formData.stats}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border font-mono text-xs"
          />
        </div>

        <div>
          <label
            htmlFor="badges"
            className="block text-sm font-medium text-gray-700"
          >
            Badges (JSON)
          </label>
          <textarea
            id="badges"
            name="badges"
            rows={5}
            value={formData.badges}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border font-mono text-xs"
          />
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200 gap-3">
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
    </form>
  );
}
