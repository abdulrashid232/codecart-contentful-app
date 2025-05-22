import { useState, useCallback } from "react";
import { environment } from "../environments/environment.development";
import {
  AuthResponse,
  CommerceLayerSkuResponse,
} from "../interfaces/commerce-layer.interfaces";


export const useCommerceLayer = () => {
  const baseUrl = `${environment.commerceLayer.endpoint}/api`;
  const authUrl = environment.commerceLayer.authUrl;

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenExpiration, setTokenExpiration] = useState<number | null>(null);
  const [productsCache, setProductsCache] =
    useState<CommerceLayerSkuResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);


  const authenticate = useCallback(async (): Promise<AuthResponse> => {
    const payload = new URLSearchParams();
    payload.set("grant_type", "client_credentials");
    payload.set("client_id", environment.commerceLayer.clientId);
    payload.set("client_secret", environment.commerceLayer.clientSecret);
    payload.set("scope", "market:all");

    try {
      const response = await fetch(authUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload.toString(),
      });

      if (!response.ok) {
        throw new Error(
          `Authentication failed with status: ${response.status}`
        );
      }

      const authResponse: AuthResponse = await response.json();

      setAccessToken(authResponse.access_token);
      setTokenExpiration(Date.now() + authResponse.expires_in * 1000 - 60000); // 1 minute buffer

      return authResponse;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Authentication failed"));
      throw err;
    }
  }, [authUrl]);

  const getValidToken = useCallback(async (): Promise<string> => {
    if (accessToken && tokenExpiration && Date.now() < tokenExpiration) {
      return accessToken;
    }

    try {
      const authResponse = await authenticate();
      return authResponse.access_token;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to get valid token")
      );
      throw err;
    }
  }, [accessToken, tokenExpiration, authenticate]);

  const getProducts =
    useCallback(async (): Promise<CommerceLayerSkuResponse> => {
      if (productsCache) {
        return productsCache;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await getValidToken();

        const response = await fetch(`${baseUrl}/skus`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.api+json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch products with status: ${response.status}`
          );
        }

        const data: CommerceLayerSkuResponse = await response.json();
        setProductsCache(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch products")
        );
        throw err;
      } finally {
        setLoading(false);
      }
    }, [baseUrl, getValidToken, productsCache]);

 
  const clearCache = useCallback((): void => {
    setProductsCache(null);
    setAccessToken(null);
    setTokenExpiration(null);
  }, []);

  return {
    getProducts,
    clearCache,
    loading,
    error,
  };
};
