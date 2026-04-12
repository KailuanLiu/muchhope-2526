import { createClerkClient } from "@clerk/backend";

async function main() {
  const email = process.env.MAIN_ADMIN_EMAIL;
  if (!email) {
    console.error(" MAIN_ADMIN_EMAIL env var is not set.");
    process.exit(1);
  }

  const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  const { data: users } = await clerk.users.getUserList({
    emailAddress: [email],
  });

  if (!users.length) {
    console.error(`No Clerk user found with email: ${email}`);
    process.exit(1);
  }

  const [user] = users;

  await clerk.users.updateUserMetadata(user.id, {
    publicMetadata: { role: "mainadmin" },
  });

  console.log(`Granted mainadmin role to ${email} (Clerk ID: ${user.id})`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
