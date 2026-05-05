import { NextResponse } from "next/server";
import { jwtVerify } from "jose"; // Using jose for Edge compatibility

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "gocycle_secure_session_secret_2026_rbac_hardened"
);

/**
 * Global RBAC Proxy (Zero Trust) — Next.js 16 proxy.js convention
 */
export async function proxy(request) {
    const { pathname } = request.nextUrl;

    // 0. Never intercept API routes â€” let them pass through always
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // 1. Define Route Access Whitelist
    const routeAccess = {
        "/admin": ["SUPER_ADMIN", "ADMIN"],
        "/seller": ["SELLER"],
        "/buyer": ["USER"]
    };

    // 2. Identify if route is protected (exact prefix match: /admin, /admin/*, not /administration)
    const protectedPrefix = Object.keys(routeAccess).find(prefix =>
        pathname === prefix || pathname.startsWith(prefix + '/')
    );

    if (!protectedPrefix) {
        return NextResponse.next();
    }

    // 3. Extract Token
    const token = request.cookies.get("gocycle_auth_token")?.value;
    
    console.log(`[MIDDLEWARE DEBUG] Path: ${pathname}, Token present: ${!!token}`);

    if (!token) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    try {
        // 4. Verify JWT (Edge Compatible)
        const { payload } = await jwtVerify(token, SECRET);
        const userRole = payload.role;
        
        console.log(`[MIDDLEWARE DEBUG] Role: ${userRole}, Allowed for prefix ${protectedPrefix}: ${JSON.stringify(routeAccess[protectedPrefix])}`);

        // 5. Strict RBAC Enforcement
        const allowedRoles = routeAccess[protectedPrefix];

        if (!allowedRoles.includes(userRole)) {
            console.error(`[SECURITY] Middleware rejection: Role ${userRole} attempted to access ${pathname}`);
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }

        return NextResponse.next();
    } catch (error) {
        console.error("[SECURITY] Middleware token verification failed", error);
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }
}

// 6. Matcher Config â€” explicitly exclude /api/, _next, and static files
export const config = {
    matcher: [
        '/admin/:path*',
        '/seller/:path*',
        '/buyer/:path*',
    ],
};
