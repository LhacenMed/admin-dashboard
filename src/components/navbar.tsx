import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownItem,
  DropdownMenu,
} from "@heroui/react";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";
import { auth } from "../../FirebaseConfig";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useAdminData } from "@/hooks/useAdminData";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { TwitterIcon, GithubIcon, DiscordIcon } from "@/components/icons";
import { Logo } from "@/components/icons";
import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";

// Add a custom style for the avatar
const avatarStyles = {
  "--avatar-img-object-fit": "contain",
  backgroundColor: "white",
} as React.CSSProperties;

export const Navbar = () => {
  const navigate = useNavigate();
  const { data: adminData, isLoading } = useAdminData(
    auth.currentUser?.uid || null
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const searchPlaceholders = [
    "Try searching for features like 'search'",
    "Try searching for features like 'search'",
    "Try searching for features like 'search'",
    "Try searching for features like 'search'",
  ];

  const searchInput = (
    <div className="w-full max-w-xs">
      <PlaceholdersAndVanishInput
        placeholders={searchPlaceholders}
        onChange={() => {
          // Handle search input change
        }}
        onSubmit={(e) => {
          e.preventDefault();
          // Handle search submit
        }}
      />
    </div>
  );

  return (
    <HeroUINavbar maxWidth="xl" position="sticky" isBordered>
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <Logo />
            <p className="font-bold text-inherit">ACME</p>
          </Link>
        </NavbarBrand>
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium"
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <Link isExternal href={siteConfig.links.twitter} title="Twitter">
            <TwitterIcon className="text-default-500" />
          </Link>
          <Link isExternal href={siteConfig.links.discord} title="Discord">
            <DiscordIcon className="text-default-500" />
          </Link>
          <Link isExternal href={siteConfig.links.github} title="GitHub">
            <GithubIcon className="text-default-500" />
          </Link>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
        {!adminData && (
          <NavbarItem className="hidden md:flex">
            <Button
              as={Link}
              className="text-md font-normal text-default-600 bg-default-100"
              href={siteConfig.links.login}
              // startContent={<HeartFilledIcon className="text-danger" />}
              variant="flat"
              disableRipple
            >
              Login
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href="#"
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>

      <NavbarContent as="div" justify="center">
        {!isLoading && (
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              {adminData ? (
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform bg-white"
                  style={avatarStyles}
                  color="warning"
                  name={adminData.name}
                  size="sm"
                  src={adminData.logo.url}
                  imgProps={{
                    className: "object-contain",
                  }}
                />
              ) : (
                <Avatar
                  isDisabled
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="primary"
                  name=""
                  size="sm"
                  src=""
                />
              )}
            </DropdownTrigger>
            {adminData ? (
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold text-primary">
                    {adminData.email}
                  </p>
                </DropdownItem>
                <DropdownItem key="admin_profile">Admin Profile</DropdownItem>
                <DropdownItem key="settings">Settings</DropdownItem>
                <DropdownItem key="help">Help & Support</DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  onPress={handleLogout}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            ) : (
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem
                  key="login"
                  className="h-10"
                  onPress={() => navigate("/login")}
                >
                  <p className="font-semibold">Login</p>
                </DropdownItem>
              </DropdownMenu>
            )}
          </Dropdown>
        )}
      </NavbarContent>
    </HeroUINavbar>
  );
};
