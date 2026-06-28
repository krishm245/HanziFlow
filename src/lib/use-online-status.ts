import { useEffect, useState } from "react";

function getOnlineStatus() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(getOnlineStatus);

  useEffect(() => {
    function updateStatus() {
      setIsOnline(getOnlineStatus());
    }

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return isOnline;
}

export { useOnlineStatus };
