import { useEffect, useState, useCallback } from "react";
import {
  Select,
  FormControl,
  Spinner,
  Text,
  Stack,
  Button,
  Card,
  TextInput,
  IconButton,
  Box,
} from "@contentful/f36-components";
import { SearchIcon, CycleIcon } from "@contentful/f36-icons";
import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useCommerceLayer } from "../services/commerce-layer.service";
import { SkuData } from "../interfaces/commerce-layer.interfaces";

interface ProductValue {
  id: string;
  code: string;
  name: string;
  imageUrl?: string;
}

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const { getProducts, loading, error, clearCache } = useCommerceLayer();
  const [products, setProducts] = useState<SkuData[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SkuData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductValue | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Load the saved value from Contentful when the component mounts
  useEffect(() => {
    const currentValue = sdk.field.getValue();
    if (currentValue) {
      setSelectedProduct(currentValue);
    }

    // Set up auto-resize of the iframe
    sdk.window.startAutoResizer();

    // Clean up on unmount
    return () => {
      sdk.window.stopAutoResizer();
    };
  }, [sdk.field, sdk.window]);

  // Fetch products from Commerce Layer
  const fetchProducts = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh) {
        clearCache();
      }

      try {
        const response = await getProducts();
        if (response?.data) {
          setProducts(response.data);
          setFilteredProducts(response.data);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    },
    [getProducts, clearCache]
  );

  // Initial fetch of products
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const lowercaseSearch = searchTerm.toLowerCase();
    const filtered = products.filter(
      (product) =>
        product.attributes.name.toLowerCase().includes(lowercaseSearch) ||
        product.attributes.code.toLowerCase().includes(lowercaseSearch)
    );

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Handle product selection
  const handleProductChange = (productId: string) => {
    if (!productId) {
      setSelectedProduct(null);
      sdk.field.setValue(null);
      return;
    }

    const selected = products.find((p) => p.id === productId);
    if (selected) {
      const productValue: ProductValue = {
        id: selected.id,
        code: selected.attributes.code,
        name: selected.attributes.name,
        imageUrl: selected.attributes.image_url,
      };

      setSelectedProduct(productValue);

      // Save the structured data to Contentful
      sdk.field.setValue(productValue);
    }
  };

  // Show loading state
  if (loading && products.length === 0) {
    return (
      <Stack alignItems="center" spacing="spacingM">
        <Spinner />
        <Text>Loading products...</Text>
      </Stack>
    );
  }

  // Show error state
  if (error && products.length === 0) {
    return (
      <Stack spacing="spacingM">
        <Text fontColor="red600">Error loading products: {error.message}</Text>
        <Button
          variant="secondary"
          onClick={() => fetchProducts(true)}
          startIcon={<CycleIcon />}
        >
          Try Again
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing="spacingM">
      <FormControl>
        <FormControl.Label>Select a Commerce Layer Product</FormControl.Label>

        {/* Search Box */}
        <Box marginBottom="spacingS">
          <TextInput
            placeholder="Search products by name or code"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<SearchIcon />}
            isDisabled={loading}
          />
        </Box>

        {/* Product Dropdown */}
        <Select
          id="product-select"
          onChange={(e) => handleProductChange(e.target.value)}
          value={selectedProduct?.id || ""}
          isDisabled={loading}
        >
          <Select.Option value="">-- Select a product --</Select.Option>
          {filteredProducts.map((product) => (
            <Select.Option key={product.id} value={product.id}>
              {product.attributes.name} ({product.attributes.code})
            </Select.Option>
          ))}
        </Select>

        {loading && (
          <FormControl.HelpText>
            <Spinner size="small" /> Refreshing products...
          </FormControl.HelpText>
        )}

        {/* Refresh Button */}
        <Box marginTop="spacingXs">
          <Button
            variant="secondary"
            size="small"
            startIcon={<CycleIcon />}
            onClick={() => fetchProducts(true)}
            isDisabled={loading}
          >
            Refresh Products
          </Button>
        </Box>
      </FormControl>

      {/* Selected Product Preview */}
      {selectedProduct && (
        <Card>
          <Stack flexDirection="row" alignItems="center" spacing="spacingM">
            {selectedProduct.imageUrl && (
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                style={{ width: "64px", height: "64px", objectFit: "contain" }}
              />
            )}
            <Stack spacing="spacingXs">
              <Text fontWeight="fontWeightDemiBold">
                {selectedProduct.name}
              </Text>
              <Text>SKU: {selectedProduct.code}</Text>
              <Text>ID: {selectedProduct.id}</Text>
            </Stack>
            <Box style={{ marginLeft: "auto" }}>
              <IconButton
                variant="negative"
                icon={<span>×</span>}
                aria-label="Clear selection"
                onClick={() => handleProductChange("")}
              />
            </Box>
          </Stack>
        </Card>
      )}

      {/* Product count stats */}
      <Text fontColor="gray500" fontSize="fontSizeS">
        {filteredProducts.length === products.length
          ? `Showing all ${products.length} products`
          : `Showing ${filteredProducts.length} of ${products.length} products`}
      </Text>
    </Stack>
  );
};

export default Field;
