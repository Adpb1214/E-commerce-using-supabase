"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

const AddProduct = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { title, description, price, stock, category } = form;

    try {
      // Validation
      if (!title || !description || !price || !stock || !category || !imageFile) {
        setError("All fields are required, including an image.");
        return;
      }

      // Upload image to Supabase Storage
      const fileExt = imageFile.name.split(".").pop();
      const filePath = `products/${Date.now()}.${fileExt}`; // Stores inside "product-images/products/"

      const { data: imageData, error: imageError } = await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile);

      if (imageError) throw imageError;

      // Get the public URL of the uploaded image
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath);
      const imageUrl = urlData.publicUrl;

      // Insert product data into Supabase table
      const { error } = await supabase.from("products").insert({
        title,
        description,
        price: Number.parseFloat(price),
        stock: Number.parseInt(stock, 10),
        category,
        image_url: imageUrl, // Store image URL in products table
      });

      if (error) throw error;

      toast.success("Product added successfully!");
      router.push("/admin/products");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300 hover:shadow-3xl">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 py-6 px-6 sm:px-10">
            <h1 className="text-3xl font-extrabold text-white text-center">Add New Product</h1>
          </div>
          <div className="p-6 sm:p-10">
            {error && (
              <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded animate-pulse">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <p>{error}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <input
                  type="text"
                  name="title"
                  placeholder="Product Title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
                <input
                  type="text"
                  name="price"
                  placeholder="Price (e.g., 49.99)"
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>
              <textarea
                name="description"
                placeholder="Product Description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <input
                  type="number"
                  name="stock"
                  placeholder="Stock Quantity"
                  value={form.stock}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
                <input
                  type="text"
                  name="category"
                  placeholder="Category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
                {/* File input for image upload */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-md font-semibold hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Adding Product...
                  </span>
                ) : (
                  "Add Product"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
