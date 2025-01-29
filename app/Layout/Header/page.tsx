import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-blue-300 shadow-md px-6 py-4 flex justify-between items-center ">
      {/* Logo */}
      <div className="font-bold text-xl text-primary">
        <Link href="/">ShopEase</Link>
      </div>

      {/* Menu (Login and Signup) */}
      <div className="hidden md:flex space-x-6">
        <Link href="/auth/login" className=" bg-primary text-white px-4 py-2 rounded-md  hover:bg-primary-dark transition-all text-primary hover:text-primary-dark font-medium">
          Login
        </Link>
        <Link
          href="/auth/register"
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-all"
        >
          Sign Up
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center">
        <button className="text-primary focus:outline-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
