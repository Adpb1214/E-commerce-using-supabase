

// app/(auth)/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="dashboard-container">
      
        {children}
      </div>
    );
  }
  