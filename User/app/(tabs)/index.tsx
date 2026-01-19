// import React from 'react';
// import { useRouter } from 'expo-router';
// // We keep the { } because HomeScreen is a named export
// import  HomeScreen  from '@/components/screens/home-screen';

// export default function TabIndex() {
//   const router = useRouter();

//   return (
//     <HomeScreen
//       // 1. Navigate to the location screen we fixed earlier
//       onLocationPress={() => router.push('/location')}

//       // 2. Placeholder for Search (we can build this later)
//       onSearchPress={() => console.log("Search clicked")}

//       // 3. Placeholder for Category clicks
//       onCategoryPress={(categoryId) => console.log("Category clicked:", categoryId)}

//       // 4. Placeholder for Service clicks
//       onServicePress={(serviceId) => console.log("Service clicked:", serviceId)}
//     />
//   );
// }

import React from 'react';
// Import the component we built. 
// Note: If you used 'export default' in home-screen.tsx, don't use {}
import HomeScreen from '@/components/screens/home-screen';

export default function TabIndex() {
  return <HomeScreen />;
}