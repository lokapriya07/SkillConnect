import { Redirect } from "expo-router";

export default function Index() {
  // This triggers the flow: Welcome -> Phone -> OTP -> Location -> Home
  return <Redirect href="/auth/login" />;
}
