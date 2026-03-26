import { AdminLayout } from "@/components/layouts/admin-layout";

const AdminLayoutRoot = ({ children }: { children: React.ReactNode }) => (
  <AdminLayout>{children}</AdminLayout>
);

export default AdminLayoutRoot;
