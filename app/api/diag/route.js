export async function GET() {
    const envVars = {
        DATABASE_URL: process.env.DATABASE_URL ? "Present (Length: " + process.env.DATABASE_URL.length + ")" : "MISSING",
        DIRECT_URL: process.env.DIRECT_URL ? "Present" : "MISSING",
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Present" : "MISSING",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Present" : "MISSING",
        NODE_ENV: process.env.NODE_ENV,
    };

    return new Response(JSON.stringify(envVars, null, 2), {
        headers: { "Content-Type": "application/json" },
    });
}
