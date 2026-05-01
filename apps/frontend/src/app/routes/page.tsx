"use client";

import Link from "next/link";

const ROUTES = [
  { path: "/", label: "Home" },
  { path: "/auth/signup", label: "Signup" },
  { path: "/auth/login", label: "Login" },
  { path: "/about-us", label: "About" },
  { path: "/Donate", label: "Donate" },
  // Route for Contact Us Page?
  { path: "/Contact", label: "Contact" },
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
