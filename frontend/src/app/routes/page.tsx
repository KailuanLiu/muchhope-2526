"use client";

import Link from "next/link";

const ROUTES = [
  { path: "/", label: "Home" },
  { path: "/auth/signup", label: "Signup" },
  { path: "/auth/login", label: "Login" },
  { path: "/About", label: "About" },
  { path: "/Donate", label: "Donate" },
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
