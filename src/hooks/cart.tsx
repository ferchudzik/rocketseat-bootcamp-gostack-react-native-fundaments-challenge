import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      try {
        const jsonCart = await AsyncStorage.getItem('@GoMarketplace:products');

        if (jsonCart) setProducts(JSON.parse(jsonCart));
      } catch (e) {
        // error reading value
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productFound = products.findIndex(
        listedProduct => listedProduct.id === product.id,
      );

      if (productFound > -1) {
        products[productFound].quantity += 1;

        setProducts([...products]);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const foundProduct = products.findIndex(product => product.id === id);

      if (foundProduct > -1) {
        products[foundProduct].quantity += 1;

        setProducts([...products]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const foundProduct = products.findIndex(product => product.id === id);

      if (foundProduct > -1) {
        products[foundProduct].quantity -= 1;

        if (products[foundProduct].quantity < 1) {
          products.splice(foundProduct, 1);
        }

        setProducts([...products]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
