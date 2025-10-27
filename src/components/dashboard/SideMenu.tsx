'use client';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

interface SideMenuProps {
  items: MenuItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
}

export default function SideMenu({
  items,
  activeItem,
  onItemClick,
}: SideMenuProps) {
  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">分析メニュー</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onItemClick(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeItem === item.id
                  ? 'bg-blue-700 text-white font-bold shadow-md'
                  : 'hover:bg-gray-100 text-gray-900 font-medium'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}


