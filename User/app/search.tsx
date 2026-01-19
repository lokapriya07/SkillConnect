import React from "react";
import { useRouter } from "expo-router";
import { SearchScreen } from "../components/screens/search-screen"; // Adjust path to where you saved the previous code

export default function SearchRoute() {
    const router = useRouter();

    // Handle the back button press
    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            // Fallback if there is no history (e.g., deep link)
            router.replace("/");
        }
    };

    // Handle selecting a service from the results
    const handleServiceSelect = (serviceId: string) => {
        // Navigate to the dynamic service details page
        // This assumes you will create a file at app/service/[id].tsx
        router.push(`/service/${serviceId}`);
    };

    return (
        <SearchScreen
            onBack={handleBack}
            onServiceSelect={handleServiceSelect}
        />
    );
}