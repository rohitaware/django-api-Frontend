import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

type SubMenuItem = {
  path: string;
  label: string;
};

type MenuItem = {
  label: string;
  icon: React.ElementType;
  submenu: SubMenuItem[];
} & ({ path: string; id?: never } | { path?: never; id: string });

export const Drawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['reports']);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  const toggleSubmenu = useCallback((menu: string) => {
    setExpandedMenus(prev =>
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  }, []);

  const isParentActive = useCallback((item: MenuItem) => {
    // Defensive: submenu should be an array, but guard just in case
    if (!Array.isArray(item.submenu) || item.submenu.length === 0) {
      return location.pathname === item.path;
    }
    return item.submenu.some(subitem => location.pathname === subitem.path);
  }, [location.pathname]);

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  const menuItems: MenuItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      submenu: []
    },
    {
      path: '/users',
      label: 'Users',
      icon: Users,
      submenu: []
    },
    {
      id: 'reports', // for submenu toggling
      label: 'Reports',
      icon: FileText,
      submenu: [
        { path: '/reports', label: 'View Reports' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between h-16 px-4 bg-gray-900 lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white p-2"
        >
          {/* The X is inside the drawer, so we only need the Menu icon here */}
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-sky-400">MoneySpot</h2>
      </header>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800 h-16">
          <h2 className="text-xl font-bold text-sky-400">MoneySpot</h2>
          {/* Close button for mobile drawer */}
          <button
            onClick={() => setIsOpen(false)}
            className="text-white p-2 lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path || item.id}>
                {item.submenu.length > 0 ? (
                  <button
                    onClick={() => toggleSubmenu(item.id!)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${
                      isParentActive(item)
                        ? 'bg-sky-500 text-white' // Always active if a child is active
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {expandedMenus.includes(item.id!) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                  </button>
                ) : (
                  <Link
                    to={item.path!}
                    onClick={() => setIsOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      isParentActive(item)
                        ? 'bg-sky-500 text-white'
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )}

                {item.submenu.length > 0 && expandedMenus.includes(item.id!) && (
                  <ul className="mt-2 ml-4 space-y-1">
                      {Array.isArray(item.submenu) ? item.submenu.map((subitem) => (
                      <li key={subitem.path}>
                        <Link
                          to={subitem.path}
                          onClick={() => setIsOpen(false)}
                          className={`block w-full text-left px-4 py-2 rounded-lg transition text-sm ${
                            isActive(subitem.path)
                              ? 'bg-sky-500 text-white font-medium'
                              : 'hover:bg-gray-800 text-gray-400'
                          }`}
                        >
                          {subitem.label}
                        </Link>
                      </li>
                    )) : null}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
