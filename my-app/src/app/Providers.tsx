// app/Providers.tsx
"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store,{ persistor } from './store/index'
import { UserProvider } from "./context/context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
 
 
    <Provider store={store}>
   <UserProvider>
     <PersistGate loading={null} persistor={persistor}>
     
        {children}
     
      </PersistGate>
      </UserProvider>
    </Provider>

  
  );
}
