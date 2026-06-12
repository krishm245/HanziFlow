import { SignInButton, UserButton } from "@clerk/react";
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  AuthRefreshing,
} from "convex/react";

function App() {
  return (
    <main>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
      <Authenticated>
        <UserButton />
      </Authenticated>
      <AuthLoading>
        <p>Still loading</p>
      </AuthLoading>
      <AuthRefreshing>
        <p>Refreshing token...</p>
      </AuthRefreshing>
    </main>
  );
}

export default App;
