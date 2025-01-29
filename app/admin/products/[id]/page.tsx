"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type product = {
  title: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  image_url: string;
};
const ProductDetails = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { id } = useParams();

  const [product, setProduct] = useState<product>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image_url: "",
  });

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setProduct(data);
        setForm({
          title: data.title,
          description: data.description,
          price: data.price,
          stock: data.stock,
          category: data.category,
          image_url: data.image_url,
        });
      } catch (err) {
        setError("Failed to fetch product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, supabase]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Update product details
  const handleUpdate = async () => {
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase
        .from("products")
        .update({
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          stock: parseInt(form.stock, 10),
          category: form.category,
          image_url: form.image_url,
        })
        .eq("id", id);

      if (error) throw error;

      alert("Product updated successfully!");
      router.refresh();
    } catch (err) {
      setError("Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;

      alert("Product deleted successfully!");
      router.push("/admin/products");
    } catch (err) {
      setError("Failed to delete product.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h1 className="text-2xl font-bold mb-6">Product Details</h1>
      <div className="mb-6">
        <img
          src={product?.image_url}
          alt={product?.title}
          className="w-full h-64 object-cover rounded-lg"
        />
      </div>
      <form className="space-y-4">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Product Name"
          className="w-full p-3 border rounded"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Product Description"
          rows={4}
          className="w-full p-3 border rounded"
        />
        <input
          type="text"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full p-3 border rounded"
        />
        <input
          type="number"
          name="stock"
          value={form.stock}
          onChange={handleChange}
          placeholder="Stock Quantity"
          className="w-full p-3 border rounded"
        />
        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category"
          className="w-full p-3 border rounded"
        />
        <input
          type="text"
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          placeholder="Image URL"
          className="w-full p-3 border rounded"
        />
      </form>
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handleUpdate}
          className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
        >
          Update Product
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white p-3 rounded hover:bg-red-600"
        >
          Delete Product
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
