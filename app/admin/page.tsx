import AdminPanel from './AdminPanel';
import './admin.css';

export const metadata = {
  title: 'Admin - Margot Atlani',
  robots: {
    follow: false,
    index: false,
  },
};

export default function AdminPage() {
  return <AdminPanel />;
}
