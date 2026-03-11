import DashboardSidebar from '@/components/DashboardSidebar'
import Navbar from '@/components/Navbar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-dark-bg flex flex-col">
            <Navbar /> {/* Keep the global top navbar */}

            <div className="flex-1 flex pt-20">
                <DashboardSidebar />

                {/* Main Content Area: Offset by sidebar width on desktop */}
                <main className="flex-1 w-full md:ml-64 p-6 md:p-10 transition-all duration-300">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
