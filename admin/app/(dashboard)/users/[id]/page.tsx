import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { UserForm } from "@/components/UserForm";

async function getUser(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
      console.error("Error fetching user:", error);
      return null;
  }
  return data;
}

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
      redirect('/users');
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit User</h1>
      <UserForm initialData={user} />
    </div>
  );
}
