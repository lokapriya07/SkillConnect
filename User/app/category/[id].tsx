// app/category/[id].tsx
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CategoryScreen } from '@/components/screens/category-screen'; // Adjust path to where you saved the previous code

export default function CategoryPage() {
    const { id } = useLocalSearchParams(); // This grabs "carpentry", "cleaning", etc.
    const router = useRouter();

    return (
        <CategoryScreen
            categoryId={id as string}
            onBack={() => router.back()}
            onCartPress={() => router.push('/cart')}
            onServiceSelect={(serviceId) => {
                // Navigate to service details (create this file later: app/service/[id].tsx)
                router.push(`/service/${serviceId}`);
            }}
        />
    );
}