import React from "react";
import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"
  }`;

function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold">Smart Task Executor</h1>
        <nav className="flex items-center gap-2">
          <NavLink to="/" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/planner" className={linkClass}>
            Planner
          </NavLink>
          <NavLink to="/focus" className={linkClass}>
            Focus
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
