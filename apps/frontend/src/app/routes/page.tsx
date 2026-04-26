"use client";

import Link from "next/link";

const ROUTES = [
  { path: "/", label: "Home" },
  { path: "/Auth/SignUp", label: "Signup" },
  { path: "/Auth/Login", label: "Login" },
  { path: "/About", label: "About" },
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
