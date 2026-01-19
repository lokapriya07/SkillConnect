// File: app/service/[id].tsx
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
// 👇 Import the component you just shared (adjust path if needed)
import ServiceDetailScreen from "@/components/screens/service-detail-screen";

export default function ServiceRoute() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // Ensure id is a string (it can be an array in rare cases)
    const serviceId = Array.isArray(id) ? id[0] : id;

    return (
        <ServiceDetailScreen
            serviceId={serviceId}
            onBack={() => router.back()}
            onGoToCart={() => router.push("/cart")}
        />
    );
}