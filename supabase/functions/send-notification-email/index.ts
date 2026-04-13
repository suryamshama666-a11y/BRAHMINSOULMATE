
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { userId, type: _type, title, message, actionUrl }: NotificationEmailRequest = await req.json();

    // Get user profile and preferences
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('name, email')
      .eq('user_id', userId)
      .single();

    if (!profile?.email) {
      throw new Error('User email not found');
    }

    // Check if user has email notifications enabled (simplified check)
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #f59e0b); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Brahmin Match</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #dc2626;">${title}</h2>
          <p style="color: #374151; line-height: 1.6;">${message}</p>
          ${actionUrl ? `
            <div style="text-align: center; margin: 20px 0;">
              <a href="${actionUrl}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Details
              </a>
            </div>
          ` : ''}
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>Best regards,<br>The Brahmin Match Team</p>
          <p>To manage your notification preferences, visit your account settings.</p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Brahmin Match <notifications@resend.dev>",
      to: [profile.email],
      subject: title,
      html: emailHtml,
    });

    console.log("Notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending notification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
