import { NextResponse, type NextRequest } from "next/server";

function redirectTo(path: string, request: NextRequest) {
  return NextResponse.redirect(new URL(path, request.url));
}

export function proxy(request: NextRequest) {
  const role = request.cookies.get("role")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isBrandPage = pathname.startsWith("/brand");
  const isCreatorPage = pathname.startsWith("/creator");

  if (role !== "brand" && role !== "creator") {
    return isAuthPage ? NextResponse.next() : redirectTo("/login", request);
  }

  const myDashboard = `/${role}`;

  if ((isBrandPage && role !== "brand") || (isCreatorPage && role !== "creator")) {
    return redirectTo(myDashboard, request);
  }
  if (pathname === "/" || isAuthPage) {
    return redirectTo(myDashboard, request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/brand/:path*", "/creator/:path*"],
};
