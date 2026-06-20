"use client";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { store } from "@/redux/store";
import { baseApi } from "@/redux/api/baseApi";

const getSocketUrl = () => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  return apiUrl.replace("/api/v1", "");
};

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = Cookies.get("adminAccessToken");
    if (!token || socketRef.current?.connected) return;

    const url = getSocketUrl();
    socketRef.current = io(url, {
      extraHeaders: { authorization: token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current.on("connect", () => {
      console.log("[Socket] Connected to", url, "id:", socketRef.current?.id);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.warn("[Socket] Disconnected:", reason);
    });

    socketRef.current.on("notification", (data) => {
      console.log("[Socket] Notification received:", data);
      store.dispatch(baseApi.util.invalidateTags(["notifications"]));
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);
}
