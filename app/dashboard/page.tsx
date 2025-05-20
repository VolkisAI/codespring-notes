/**
 * Dashboard page for Template App
 * Displays the main dashboard interface for authenticated users
 * Features a sidebar navigation and content area
 * Requires a paid membership to access
 */

/**
 * Main dashboard page component
 * The profile is provided by the parent layout component
 */
export default function DashboardPage() {
  return (
    <main className="p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-8">Your Notes</h1>
      {/* Content for Your Notes will go here */}
    </main>
  );
} 