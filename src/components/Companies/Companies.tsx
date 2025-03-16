import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Avatar,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Table,
} from "@heroui/react";
import { FiMoreVertical, FiDownload } from "react-icons/fi";
import { collection, query, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../FirebaseConfig";

interface Company {
  id: string;
  name: string;
  email: string;
  logo: {
    publicId: string;
    url: string;
  };
  location: string;
  phoneNumber: string;
  businessLicense: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: any;
  updatedAt: any;
}

const statusColorMap: Record<string, "warning" | "success" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export const Companies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      const companiesRef = collection(db, "transportation_companies");
      const querySnapshot = await getDocs(companiesRef);
      const companiesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Company[];
      setCompanies(companiesData);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleStatusUpdate = async (
    companyId: string,
    newStatus: "approved" | "rejected"
  ) => {
    try {
      const companyRef = doc(db, "transportation_companies", companyId);
      await updateDoc(companyRef, {
        status: newStatus,
        updatedAt: new Date(),
      });
      // Refresh companies list
      fetchCompanies();
    } catch (error) {
      console.error("Error updating company status:", error);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    return new Date(date.seconds * 1000).toLocaleDateString();
  };

  const renderCell = (company: Company, columnKey: string) => {
    switch (columnKey) {
      case "company":
        return (
          <div className="flex items-center gap-3">
            <Avatar
              src={company.logo?.url}
              alt={company.name}
              className="bg-foreground/10"
            />
            <div className="flex flex-col">
              <p className="text-sm font-semibold">{company.name}</p>
              <p className="text-xs text-default-500">{company.email}</p>
            </div>
          </div>
        );
      case "contact":
        return (
          <div className="flex flex-col">
            <p className="text-sm">{company.phoneNumber}</p>
            {company.businessLicense && (
              <Tooltip content="Download Business License">
                <Button
                  size="sm"
                  variant="light"
                  startContent={<FiDownload size={16} />}
                  className="text-xs"
                >
                  License
                </Button>
              </Tooltip>
            )}
          </div>
        );
      case "location":
        return (
          <p className="text-sm">
            {company.location?._lat && company.location?._long
              ? `[${company.location._lat.toFixed(6)}, ${company.location._long.toFixed(6)}]`
              : typeof company.location === "string"
                ? company.location
                : "No location"}
          </p>
        );
      case "status":
        return (
          <Chip color={statusColorMap[company.status]} size="sm" variant="flat">
            {company.status}
          </Chip>
        );
      case "registered":
        return <p className="text-sm">{formatDate(company.createdAt)}</p>;
      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly variant="light" size="sm">
                <FiMoreVertical />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              {[
                ...(company.status === "pending"
                  ? [
                      <DropdownItem
                        key="approve"
                        className="text-success"
                        onClick={() =>
                          handleStatusUpdate(company.id, "approved")
                        }
                      >
                        Approve
                      </DropdownItem>,
                      <DropdownItem
                        key="reject"
                        className="text-danger"
                        onClick={() =>
                          handleStatusUpdate(company.id, "rejected")
                        }
                      >
                        Reject
                      </DropdownItem>,
                    ]
                  : []),
                <DropdownItem key="edit">Edit Details</DropdownItem>,
              ]}
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return null;
    }
  };

  const columns = [
    { name: "COMPANY", uid: "company" },
    { name: "CONTACT", uid: "contact" },
    { name: "LOCATION", uid: "location" },
    { name: "STATUS", uid: "status" },
    { name: "REGISTERED", uid: "registered" },
    { name: "ACTIONS", uid: "actions" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Transportation Companies</h2>
            <p className="text-default-500">
              Manage and approve transportation companies
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Companies table">
            <TableHeader>
              {columns.map((column) => (
                <TableColumn key={column.uid}>{column.name}</TableColumn>
              ))}
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  {columns.map((column) => (
                    <TableCell key={`${company.id}-${column.uid}`}>
                      {renderCell(company, column.uid)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};
