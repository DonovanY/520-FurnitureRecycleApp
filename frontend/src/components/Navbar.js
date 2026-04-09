import { Link } from "react-router-dom";

const LINKS = [
  { to: "/login", label: "Log In", style: "text-sm text-gray-600 hover:text-gray-900 px-3 py-2" },
  { to: "/signup", label: "Sign Up", style: "text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700" },
];

function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-green-700">
        FurniCycle
      </Link>
      <div className="flex gap-3">
        {LINKS.map(({ to, label, style }) => (
          <Link key={to} to={to} className={style}>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;
