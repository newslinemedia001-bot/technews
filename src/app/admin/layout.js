import '../globals.css';

export const metadata = {
    title: 'Admin - TechNews',
    description: 'TechNews Admin Dashboard',
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminLayout({ children }) {
    return children;
}
