import Sidebar from './Sidebar';

const Layout = ({ children }) => (
  <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
    <Sidebar />
    <main className="flex-1 overflow-y-auto">
      {children}
    </main>
  </div>
);

export default Layout;
