const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {/* Logo & About */}
        <div>
          <h2 className="text-2xl font-bold">ShopEase</h2>
          <p className="text-gray-400 mt-3">
            Elevate your shopping experience with our exclusive collection of fashion, gadgets, and more.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-gray-300">Home</a></li>
            <li><a href="#" className="hover:text-gray-300">Shop</a></li>
            <li><a href="#" className="hover:text-gray-300">About Us</a></li>
            <li><a href="#" className="hover:text-gray-300">Contact</a></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Customer Service</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-gray-300">FAQs</a></li>
            <li><a href="#" className="hover:text-gray-300">Shipping & Returns</a></li>
            <li><a href="#" className="hover:text-gray-300">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-gray-300">Terms & Conditions</a></li>
          </ul>
        </div>

        {/* Newsletter & Socials */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Stay Updated</h3>
          <p className="text-gray-400">Subscribe to get special offers and updates.</p>
          <div className="flex mt-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="p-2 flex-1 bg-gray-800 rounded-l-md border border-gray-700 focus:outline-none"
            />
            <button className="px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-r-md">
              Subscribe
            </button>
          </div>

          {/* Social Media Icons */}
          <div className="flex space-x-4 mt-5">
            <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-facebook text-xl"></i></a>
            <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-instagram text-xl"></i></a>
            <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-twitter text-xl"></i></a>
            <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-youtube text-xl"></i></a>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="mt-10 text-center text-gray-500 border-t border-gray-700 pt-5">
        <p>© {new Date().getFullYear()} ShopEase. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
