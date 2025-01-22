// app/(auth)/layout.tsx
export default function clientLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="client-container">
        {children}
      </div>
    );
  }