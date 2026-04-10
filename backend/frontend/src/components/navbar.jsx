import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Stethoscope, 
  Menu, 
  X, 
  ChevronRight, 
  Calendar, 
  Activity, 
  Home as HomeIcon,
  LogOut,
  LayoutDashboard,
  Users,
  UserPlus,
  ClipboardList, 
  User,           
  CalendarDays      
} from "lucide-react";

const NavBar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  // --- Updated Dynamic Navigation Logic ---
  const getNavLinks = () => {
    if (user?.role === 'ADMIN') {
      return [
        { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
        { name: "All Doctors", path: "/admin/all-doctors", icon: <Users size={18} /> },
        { name: "Add Doctor", path: "/admin/add-doctor", icon: <UserPlus size={18} /> },
      ];
    } 
    
    if (user?.role === 'DOCTOR') {
      return [
        { name: "Dashboard", path: "/doctor/dashboard", icon: <LayoutDashboard size={18} /> },
        { name: "Profile", path: "/doctor/update-profile", icon: <User size={18} /> },
      ];
    }

    // Default Public Links
    return [
      { name: "Home", path: "/", icon: <HomeIcon size={18} /> },
      { name: "Find a Doctor", path: "/booking", icon: <Calendar size={18} /> },
      { name: "Services", path: "/services", icon: <Activity size={18} /> },
    ];
  };

  const navLinks = getNavLinks();

  const Logo = () => (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="bg-green-600/10 p-2 rounded-xl group-hover:bg-green-600/20 transition-colors">
        <Stethoscope className="text-green-600" size={24} />
      </div>
      <span className="text-xl font-extrabold text-slate-900 tracking-tight">
        City<span className="text-green-600">Hospital</span>
      </span>
    </Link>
  );

  return (
    <nav className="fixed top-0  w-full bg-white/90 backdrop-blur-md border-b border-slate-100 z-[100] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-7">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-green-600 transition-all py-2"
                  >
                    <span className="opacity-70 text-green-600">{link.icon}</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* --- Auth Actions --- */}
            <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
              {!user ? (
                <>
                  {/* <Link
                    to="/login"
                    className="text-sm font-bold text-slate-700 hover:text-green-600 px-3 transition-colors"
                  >
                    Sign In
                  </Link> */}
                  <Link
                    to="/login"
                    className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all flex items-center gap-2"
                  >
                    Login
                    <ChevronRight size={16} />
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Optional: Show "Logged in as Dr. [Name]" */}
                  {user.role === 'DOCTOR' && (
                    <span className="text-xs font-bold text-slate-400">Dr. Mode</span>
                  )}
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold text-sm bg-red-50 px-5 py-2.5 rounded-xl transition-all active:scale-95"
                  >
                    <LogOut size={18} />  
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`lg:hidden bg-white border-t border-slate-50 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-8 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 text-slate-600 hover:text-green-600 hover:bg-green-50/50 p-4 rounded-2xl font-bold transition-all"
            >
              <span className="text-green-600 bg-green-50 p-2 rounded-lg ">{link.icon}</span>
              {link.name}
            </Link>
          ))}
          
          <div className="pt-6 border-t border-slate-100 grid gap-3">
            {!user ? (
              <>
                {/* <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center border border-slate-200 py-4 rounded-2xl font-bold text-slate-700"
                >
                  Sign In
                </Link> */}
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center bg-green-600 py-4 rounded-2xl font-bold text-white"
                >
                  Login
                </Link>
              </>
            ) : (
              <button
                onClick={() => { onLogout(); setIsOpen(false); }}
                className="w-full flex items-center justify-center bg-red-50 py-4 rounded-2xl font-bold text-red-500"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;