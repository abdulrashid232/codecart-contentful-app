// Example of using the Commerce Layer hook in a React component
import React, { useEffect, useState } from "react";
import { useCommerceLayer } from "../services/commerce-layer.service";
import { CommerceLayerSkuResponse } from "../interfaces/commerce-layer.interfaces";

const ProductsList: React.FC = () => {
  const { getProducts, loading, error, clearCache } = useCommerceLayer();
  const [products, setProducts] = useState<CommerceLayerSkuResponse | null>(
    null
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, [getProducts]);

  const handleRefresh = () => {
    clearCache();
    getProducts().then(setProducts);
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error loading products: {error.message}</p>
        <button onClick={handleRefresh}>Try Again</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Products</h2>
      <button onClick={handleRefresh}>Refresh</button>

      {products?.data && products.data.length > 0 ? (
        <ul>
          {products.data.map((product) => (
            <li key={product.id}>
              <strong>{product.attributes.name}</strong> -{" "}
              {product.attributes.code}
              {product.attributes.image_url && (
                <img
                  src={product.attributes.image_url}
                  alt={product.attributes.name}
                  style={{ width: "50px", marginLeft: "10px" }}
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No products found</p>
      )}
    </div>
  );
};

export default ProductsList;
