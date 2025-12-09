import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { SearchIcon, XIcon, MenuIcon, TicketPlus, TicketPlusIcon } from "lucide-react";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";

const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false);
  const {user} = useUser()
  const {openSignIn} = useClerk()

  const navigate = useNavigate()


  return (
    <div
      className="
        fixed top-0 left-0 w-full z-50
        flex items-center justify-between
        px-6 md:px-16 lg:px-36 py-5
      "
    >
      {/* Logo */}
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="w-36 h-auto" />
      </Link>

      {/* Menu Panel */}
      <div
        className={`
          max-md:fixed max-md:top-0 max-md:left-0 
          max-md:h-screen max-md:w-64
          max-md:bg-black/80 max-md:flex max-md:flex-col 
          max-md:items-center max-md:justify-center 
          max-md:text-lg max-md:font-medium
          transform transition-transform duration-300

          ${isOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"}

          md:flex md:flex-row md:items-center
          gap-8 px-8 py-3
          md:bg-white/10 md:border border-gray-300/20 
          md:rounded-full backdrop-blur
        `}
      >
        {/* Close Icon */}
        <XIcon
          className="md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer"
          onClick={() => setIsOpen(false)}
        />

        <Link onClick={() => {scrollTo(0,0); setIsOpen(false)}} to="/">
          Home
        </Link>
        <Link onClick={() => {scrollTo(0,0); setIsOpen(false)}} to="/movies">
          Movies
        </Link>
        <Link onClick={() => {scrollTo(0,0); setIsOpen(false)}} to="/">
          Theaters
        </Link>
        <Link onClick={() => {scrollTo(0,0); setIsOpen(false)}} to="/">
          Releases
        </Link>
        <Link onClick={() => {scrollTo(0,0); setIsOpen(false)}} to="/favourite">
          Favourites
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-8">
        <SearchIcon className="max-md:hidden w-6 h-6 cursor-pointer" />

        {
            // check if user is already logged in or not
            // if logged in then show user profile otherwise login button

            !user ? (
                <button onClick={openSignIn}
                   className="px-4 py-1 sm:px-7 sm:py-2
                   bg-primary hover:bg-primary-dull
                   transition rounded-full font-medium cursor-pointer">
                    Login
                </button>

            ) : (
                
                // if already present then user profile
                // for this use clerk component-- UserButton
                 <UserButton>
                    <UserButton.MenuItems>
                       <UserButton.Action
                           label="My Bookings"
                           labelIcon={<TicketPlusIcon width={15}/>}
                           onClick={() => navigate("/my-bookings")}
                        />
                    </UserButton.MenuItems>
                </UserButton>
            )
        }
        
      </div>

      {/* Hamburger Icon */}
      <MenuIcon
        className="md:hidden w-8 h-8 cursor-pointer"
        onClick={() => setIsOpen(true)}
      />
    </div>
  );
};

export default Navbar;
