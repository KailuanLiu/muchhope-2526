"use client";

import Link from "next/link";

const ROUTES = [
  { path: "/", label: "Home" },
  { path: "/Auth/SignUp", label: "Signup" },
  { path: "/Auth/Login", label: "Login" },
  { path: "/About", label: "About" },
];

export default function Page() {
  return (
    <main>
      <nav>
        <ul>
          {ROUTES.map((r) => (
            <li key={r.path}>
              <Link href={r.path}>{r.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
