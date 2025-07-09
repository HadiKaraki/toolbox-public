import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
// import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <SideBar/>
      <div className="mx-auto">
        <Outlet/>
      </div>
    </div>
  )
};