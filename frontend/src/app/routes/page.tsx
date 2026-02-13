"use client";

import Link from "next/link";
import Signup from "../../components/Signup";

const ROUTES = [
  { path: "/", label: "Home" },
  { path: "/signup", label: "Signup" },
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

      <Signup />
    </main>
  );
}
