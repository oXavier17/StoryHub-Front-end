import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

export default function Layout() {
    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
            <Sidebar />
            <main className="flex-1 p-6 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    )
}