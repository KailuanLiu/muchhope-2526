"use client";

import Link from "next/link";

const ROUTES = [
  { path: "/", label: "Home" },
  { path: "/signup", label: "Signup" },
  { path: "/login", label: "Login" },
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
