import { useQuery } from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../FirebaseConfig";

interface AdminData {
  id: string;
  name: string;
  email: string;
  logo: {
    publicId: string;
    url: string;
  };
  firebaseUid: string;
  createdAt: any;
  updatedAt: any;
}

type AdminQueryKey = string | null;

export const useAdminData = (
  queryKey: AdminQueryKey,
  queryType: "id" | "firebaseUid" = "firebaseUid"
) => {
  return useQuery<AdminData | null, Error>({
    queryKey: ["adminData", queryKey, queryType],
    queryFn: async () => {
      if (!queryKey) return null;

      let adminDoc;
      let data;

      if (queryType === "id") {
        // Direct document lookup by ID
        const docRef = doc(db, "admins", queryKey);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          console.error("Admin document not found");
          return null;
        }

        adminDoc = docSnap;
        data = docSnap.data();
      } else {
        // Query by firebaseUid
        const adminsRef = collection(db, "admins");
        const q = query(adminsRef, where("firebaseUid", "==", queryKey));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.error("Admin document not found");
          return null;
        }

        adminDoc = querySnapshot.docs[0];
        data = adminDoc.data();
      }

      return {
        id: adminDoc.id,
        name: data.name,
        email: data.email,
        logo: {
          publicId: data.logo?.publicId || "",
          url: data.logo?.url || "",
        },
        firebaseUid: data.firebaseUid,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    },
    enabled: !!queryKey,
    staleTime: 1 * 60 * 1000, // Consider data fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
