// app/Providers.tsx
"use client";

import { Provider } from "react-redux";
import store from './store/index'
import { UserProvider } from "./context/context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <UserProvider>
        {children}
      </UserProvider>
    </Provider>
  );
}
