import React from "react";
import Image from "next/image";
import Link from "next/link";
import SignUpButton from "./SignUpButton";

const Navbar: React.FC = () => {
    const navbarLinks = [
        { label: "Home", link: "/" },
        { label: "Gateways", link: "/" },
        { label: "Assets", link: "/" },
    ];

    return (
        <div className="flex flex-row items-center justify-center gap-x-[17.5%] mx-24 mt-2">
            <Image
                src="/branding/TensorIoT-Logo-Black.svg"
                width={150}
                height={150}
                alt="brand"
                className="select-none my-4"
            />
            <div className="flex flex-row gap-x-16 items-center justify-center">
                {navbarLinks.map((navItem) => (
                    <div key={navItem.label} className="flex flex-row gap-x-1">
                        <Link href={navItem.link}>
                            <h1 className="text-lg font-medium text-[#494949]">{navItem.label}</h1>
                        </Link>
                    </div>
                ))}
            </div>
            <div className="flex flex-row gap-x-6 items-center justify-center">
                <Link href={"/"}>
                    <h1 className="text-lg font-medium text-[#494949]">{"Login"}</h1>
                </Link>
                <SignUpButton/>
            </div>
        </div>
    );
};

export default Navbar;
