import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date().toISOString();

    // Get pending reminders that should be sent
    const { data: pendingReminders, error: fetchError } = await supabase
      .from("vdate_reminders")
      .select("*")
      .eq("sent", false)
      .lte("reminder_time", now);

    if (fetchError) {
      throw fetchError;
    }

    if (!pendingReminders || pendingReminders.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No pending reminders", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let processedCount = 0;
    const errors: string[] = [];

    for (const reminder of pendingReminders) {
      try {
        // Get the V-Date details
        const { data: vdate, error: vdateError } = await supabase
          .from("vdates")
          .select("*")
          .eq("id", reminder.vdate_id)
          .eq("status", "scheduled")
          .single();

        if (vdateError || !vdate) {
          // V-Date no longer exists or not scheduled, mark reminder as sent
          await supabase
            .from("vdate_reminders")
            .update({ sent: true })
            .eq("id", reminder.id);
          continue;
        }

        // Format reminder text based on type
        let reminderText = "";
        switch (reminder.reminder_type) {
          case "24_hours":
            reminderText = "starting in 24 hours";
            break;
          case "1_hour":
            reminderText = "starting in 1 hour";
            break;
          case "15_minutes":
            reminderText = "starting in 15 minutes";
            break;
        }

        // Format the scheduled date
        const scheduledDate = new Date(vdate.scheduled_time);
        const formattedDate = scheduledDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        // Create notifications for both users
        const notifications = [
          {
            user_id: vdate.user_id_1,
            type: "vdate",
            title: "V-Date Reminder",
            content: `Your V-Date is ${reminderText}! Scheduled for ${formattedDate}.`,
            related_user_id: vdate.user_id_2,
            related_entity_id: vdate.id,
          },
          {
            user_id: vdate.user_id_2,
            type: "vdate",
            title: "V-Date Reminder",
            content: `Your V-Date is ${reminderText}! Scheduled for ${formattedDate}.`,
            related_user_id: vdate.user_id_1,
            related_entity_id: vdate.id,
          },
        ];

        const { error: notifError } = await supabase
          .from("notifications")
          .insert(notifications);

        if (notifError) {
          errors.push(`Failed to send notification for reminder ${reminder.id}: ${notifError.message}`);
        }

        // Mark reminder as sent
        await supabase
          .from("vdate_reminders")
          .update({ sent: true })
          .eq("id", reminder.id);

        processedCount++;
      } catch (err: any) {
        errors.push(`Error processing reminder ${reminder.id}: ${err.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        total: pendingReminders.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
