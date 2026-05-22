// app/api/contact/route.js
import prisma from "../../../backend-actions/lib/prisma";

/**
 * POST handler for contact form submissions.
 * Expects JSON body with: firstName, lastName, email, organization?, phone, message.
 */
export async function POST(req) {
  try {
    const data = await req.json();
    const { firstName, lastName, email, organization, phone, message } = data;

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !message) {
      return new Response(
        JSON.stringify({ success: false, message: "Please fill in all required fields." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const newMessage = await prisma.contactMessage.create({
      data: { firstName, lastName, email, organization, phone, message },
    });

    return new Response(
      JSON.stringify({ success: true, message: "Your message has been sent successfully!", data: newMessage }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in /api/contact POST:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to send message. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
