import { RouterProvider } from "react-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { router } from "./routes";

export default function App() {
  return (
    <SafeAreaProvider>
      <RouterProvider router={router} />
    </SafeAreaProvider>
  );
}