import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth'; // We'll need to update verifyToken to support Edge or move validation
// verifyToken uses jsonwebtoken which might not work in Edge runtime unless we use 'jose'. 
// For now, Next.js Middleware runs on Edge. 'jsonwebtoken' often fails on Edge.
// We should use 'jose' for middleware or just basic cookie check if we trust the cookie signatures (we don't for role).

// Actually, let's skip complex JWT verification in middleware for now to avoid Edge issues with 'jsonwebtoken'.
// We will just check if cookie exists, and let the Layout/Page do the heavy lifting/redirect if invalid.
// OR we install 'jose' which is Edge compatible.
// "Do NOT over-engineer".
// Simple check: Cookie presence.

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const path = request.nextUrl.pathname;

    if (path.startsWith('/admin') || path.startsWith('/sales')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // We rely on Layouts to check Role.
    // This middleware just ensures *some* login.

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/sales/:path*'],
};
