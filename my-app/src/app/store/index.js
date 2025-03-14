"use client"
import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./slices/chatSlice";
import notificationsReducer from "./slices/notificationSlice";
import storage from "redux-persist/lib/storage"; 
import { persistReducer, persistStore } from "redux-persist";

const persistConfig = {
    key: "root",
    storage:storage,
};

const persistedChatReducer = persistReducer(persistConfig, chatReducer);


const store = configureStore({
    reducer: {
        chat: persistedChatReducer,
        notifications: notificationsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, 
        }),
});


export const persistor = persistStore(store);
export default store;
