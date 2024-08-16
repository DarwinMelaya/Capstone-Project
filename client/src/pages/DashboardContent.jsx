// client/src/pages/DashboardContent.jsx
import React from "react";
import { Outlet } from "react-router-dom";

export default function DashboardContent() {
  return (
    <div className="flex">
      <Outlet />
    </div>
  );
}
