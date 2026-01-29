import { createClient } from "@/utils/supabase/server";

export async function logAuditAction(
  action: string,
  entityType: string,
  entityId: string,
  details: any,
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("Audit Log Error: No authenticated user found");
      return;
    }

    // Fetch admin details for snapshot
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role, email")
      .eq("id", user.id)
      .single();

    if (!adminUser) {
      console.warn(
        "Audit Log Warning: Action performed by non-admin user",
        user.id,
      );
    }

    const { error } = await supabase.from("admin_audit_logs").insert({
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      admin_id: user.id,
      admin_email: adminUser?.email || user.email,
      admin_role: adminUser?.role || "support", // Default fallback
      // ip_address could be retrieved from headers() if needed
    });

    if (error) {
      console.error("Failed to write audit log:", error);
    }
  } catch (err) {
    console.error("Error in logAuditAction:", err);
  }
}
