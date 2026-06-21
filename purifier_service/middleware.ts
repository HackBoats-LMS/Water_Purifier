import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin pages protection
    if (path.startsWith("/adminDashboard") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/workerDashboard", req.url));
    }

    // Worker pages protection (optional: if you want to keep admins out of worker dashboard, though usually admins can see it)
    if (path.startsWith("/workerDashboard") && token?.role !== "WORKER" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/adminDashboard/assignments", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/adminDashboard/:path*',
    '/workerDashboard/:path*'
  ],
};
