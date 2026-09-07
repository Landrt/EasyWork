import { redirect } from 'next/navigation';
import { checkAdminAccess } from '@/utils/actions/admin/actions';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin } = await checkAdminAccess();

  if (!isAdmin) {
    redirect('/auth/login?error=admin_required');
  }

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1C1B18] flex font-sans antialiased selection:bg-[#C9A96E]/30 selection:text-[#1C1B18]">
      {/* Editorial Cream Sidebar */}
      <AdminSidebar />

      {/* Main Administrative Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#fbf9f5]">
        {children}
      </div>
    </div>
  );
}
