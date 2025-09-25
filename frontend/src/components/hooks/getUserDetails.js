import { useEffect, useState } from "react";
import { useAuth } from "../contexts/authContext";

export function useUserDetails() {
  const { userId, loading: authLoading } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!userId) {
        console.log("No userId available, skipping fetch.");
        return;
      }

      setLoadingDetails(true);
      setError(null);

      try {
        const response = await fetch(`/users/${userId}`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user information");
        }

        const userData = await response.json();
        setUserDetails(userData);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Could not load user details");
      } finally {
        setLoadingDetails(false);
      }
    };

    if (!authLoading) {
      console.log("Auth loading complete, fetching user details...");
      fetchDetails();
    } else {
      console.log("Auth loading, waiting...");
    }
  }, [userId, authLoading]);

  return { userDetails, error, loadingDetails };
}
