import StatusPage from "@/components/StatusPage";

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Page not found"
      message="The page you're looking for doesn't exist or may have been moved. Let's get you back on track."
    />
  );
}
