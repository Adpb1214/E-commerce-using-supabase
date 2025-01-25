"use client";

import { useSearchParams } from "next/navigation";

const CheckoutPage = () => {
  const searchParams = useSearchParams();
  const productString = searchParams.get("product");

  // Parse the product data
  const product = productString ? JSON.parse(productString) : null;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Checkout</h1>
      {product ? (
        <div>
          <p>Product Name: {product.name}</p>
          <p>Price: ₹{product.price}</p>
          <p>Quantity: {product.quantity}</p>
          <button className="bg-green-500 text-white px-4 py-2 rounded">
            Mock Pay Now
          </button>
        </div>
      ) : (
        <p>No product selected for checkout.</p>
      )}
    </div>
  );
};

export default CheckoutPage;
