import { useState } from "react";
import { Card, CardHeader, CardBody, Input, Button, Link } from "@heroui/react";
import DefaultLayout from "@/layouts/default";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../FirebaseConfig";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDocs, collection, query } from "firebase/firestore";
import { FileUpload } from "@/components/ui/file-upload";
import { addAccountToLocalStorage } from "@/utils/localAccounts";
import { Timestamp } from "firebase/firestore";

interface AdminData {
  name: string;
  email: string;
  logo: {
    publicId: string;
    url: string;
  };
  firebaseUid: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LoadingState {
  logo: boolean;
  submit: boolean;
}

// Function to generate a random 4-digit number with leading zeros
const generateRandomId = () => {
  return Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
};

// Function to check if an admin ID already exists
const checkAdminIdExists = async (adminId: string) => {
  const adminDoc = await getDocs(query(collection(db, "admins")));
  return adminDoc.docs.some((doc) => doc.id === adminId);
};

// Function to generate a unique admin ID
const generateUniqueAdminId = async (): Promise<string> => {
  let adminId: string;
  let exists: boolean;

  do {
    adminId = `admin_${generateRandomId()}`;
    exists = await checkAdminIdExists(adminId);
  } while (exists);

  return adminId;
};

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState<LoadingState>({
    logo: false,
    submit: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const navigate = useNavigate();

  // Admin Information State
  const [adminData, setAdminData] = useState<Partial<AdminData>>({
    name: "",
    logo: {
      publicId: "",
      url: "",
    },
  });

  const handleFilesUpload = (files: File[]) => {
    setFiles(files);
    console.log(files);
  };

  // Wrapper function to match the expected prop type
  const handleAdminDataUpdate = (prev: any) => {
    setAdminData(prev);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading((prev) => ({ ...prev, submit: true }));

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading((prev) => ({ ...prev, submit: false }));
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      setIsLoading((prev) => ({ ...prev, submit: false }));
      return;
    }

    if (!adminData.name) {
      setError("Please enter your name");
      setIsLoading((prev) => ({ ...prev, submit: false }));
      return;
    }

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const now = Timestamp.now();

      // Generate unique admin ID
      const adminId = await generateUniqueAdminId();

      // Prepare admin data for Firestore
      const adminDocData = {
        name: adminData.name,
        email: userCredential.user.email,
        firebaseUid: userCredential.user.uid,
        logo: {
          publicId: adminData.logo?.publicId || "",
          url: adminData.logo?.url || "",
        },
        createdAt: now,
        updatedAt: now,
      };

      // Save admin data to Firestore using custom admin ID
      const adminRef = doc(db, "admins", adminId);
      await setDoc(adminRef, adminDocData);

      // Save to local storage with ISO string for date
      addAccountToLocalStorage({
        id: adminId,
        name: adminData.name,
        email: userCredential.user.email || "",
        logo: {
          publicId: adminData.logo?.publicId || "",
          url: adminData.logo?.url || "",
          uploadedAt: now.toDate().toISOString(),
        },
      });

      console.log("Admin data saved successfully:", adminDocData);
      setIsLoading((prev) => ({ ...prev, submit: false }));
      navigate("/login");
    } catch (error: any) {
      let errorMessage = "Failed to create an account";
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Email already in use";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Email/password accounts are not enabled";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak";
          break;
        default:
          errorMessage = error.message;
      }
      setError(errorMessage);
      console.error("Signup error:", error.message);
    } finally {
      setIsLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <Card className="w-full max-w-2xl p-6">
          <CardHeader className="flex flex-col gap-2 items-center">
            <h1 className="text-2xl font-bold">Create Admin Account</h1>
            <p className="text-default-500">Register as an administrator</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <div className="space-y-3">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                  required
                />
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  }
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />

                <Input
                  label="Name"
                  value={adminData.name}
                  onChange={(e) =>
                    setAdminData({ ...adminData, name: e.target.value })
                  }
                  placeholder="Enter admin name"
                  required
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Admin Logo
                  </label>
                  <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
                    <FileUpload
                      onChange={handleFilesUpload}
                      type="logo"
                      setCompanyData={handleAdminDataUpdate}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                color="primary"
                className="w-full mt-6"
                size="lg"
                isLoading={isLoading.submit}
              >
                Create Admin Account
              </Button>
            </form>
            <div className="mt-4 text-center text-default-500">
              Already have an account?{" "}
              <Link href="/login" className="text-primary">
                Sign in
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </DefaultLayout>
  );
}
