import { redirect } from "next/navigation";

// Root page redirects to marketing home
// Authenticated users can access /app/dashboard directly
export default function RootPage() {
  redirect("/home");
}
