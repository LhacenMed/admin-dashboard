import { useState } from "react";
import { Card, CardHeader, CardBody, Input, Button, Link } from "@heroui/react";
import DefaultLayout from "@/layouts/default";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../FirebaseConfig";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { addAccountToLocalStorage } from "@/utils/localAccounts";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting login with:", email);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Login successful, user:", userCredential.user.uid);

      // Find admin document by firebaseUid
      const adminsRef = collection(db, "admins");
      const q = query(
        adminsRef,
        where("firebaseUid", "==", userCredential.user.uid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const adminDoc = querySnapshot.docs[0];
        const adminData = adminDoc.data();
        console.log("Admin data fetched:", adminData);

        // Save to local storage
        const accountData = {
          id: adminDoc.id, // This will be in the format admin_XXXX
          name: adminData.name,
          email: adminData.email,
          logo: {
            publicId: adminData.logo?.publicId || "",
            url: adminData.logo?.url || "",
            uploadedAt: adminData.createdAt.toDate().toISOString(),
          },
        };
        console.log("Saving account to local storage:", accountData);
        const saved = addAccountToLocalStorage(accountData);
        console.log("Save to local storage result:", saved);
      } else {
        throw new Error("No admin account found for this user");
      }

      setIsLoading(false);
      navigate("/dashboard");
    } catch (error: any) {
      let errorMessage = "Failed to login";
      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled";
          break;
        case "auth/user-not-found":
          errorMessage = "User not found";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        default:
          errorMessage = error.message;
          break;
      }
      setError(errorMessage);
      setIsLoading(false);
      console.error("Login error:", error.message);
    }
  };

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <Card className="w-full max-w-md p-6">
          <CardHeader className="flex flex-col gap-2 items-center">
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-default-500">Sign in to your admin account</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <Button
                type="submit"
                color="primary"
                className="w-full mt-2"
                size="lg"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </form>
            <div className="mt-4 text-center text-default-500">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary">
                Sign up
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </DefaultLayout>
  );
}
