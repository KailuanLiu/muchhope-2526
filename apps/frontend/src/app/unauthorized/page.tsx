import StatusPage from "@/components/StatusPage";

export default function UnauthorizedPage() {
  return (
    <StatusPage
      code="403"
      title="Access denied"
      message="You don't have permission to view this page. This area is reserved for administrators."
    />
  );
}
