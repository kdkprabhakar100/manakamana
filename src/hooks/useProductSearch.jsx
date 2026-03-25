import { useState, useContext, createContext } from "react";

const ProductSearchContext = createContext();

export function ProductSearchProvider({ children }) {
  const [search, setSearch] = useState("");
  return (
    <ProductSearchContext.Provider value={{ search, setSearch }}>
      {children}
    </ProductSearchContext.Provider>
  );
}

export function useProductSearch() {
  return useContext(ProductSearchContext);
}
