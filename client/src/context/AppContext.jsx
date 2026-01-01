import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL; // providing base url for axios from environment variable

export const AppContext = createContext();

export const AppProvider = ({ children }) => {

    // value that is accessible in all the components

    const [isAdmin, setIsAdmin] = useState(false);
    const [shows, setShows] = useState([]);
    const [favoriteMovies, setFavoriteMovies] = useState([]);

    // import the base url of image from TMDB do that it can accessible to all the components
    const TMDB_IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

    // get user from clerk and set headers for axios
    const {user} = useUser();
    const {getToken} = useAuth();
    const location = useLocation();

    const navigate  = useNavigate();

    // function to check that the user is admin or not
    const fetchIsAdmin = async () => {
        try {
            const {data} = await axios.get('/api/admin/is-admin', {headers: {
                Authorization: `Bearer ${await getToken()}` }});
            setIsAdmin(data.isAdmin);

            // if user is not admin and trying to access admin route, redirect to home page
            if(!data.isAdmin && location.pathname.startsWith('/admin')){
                navigate('/');
                toast.error('Access Denied. Admins Only.');
            }
        } catch (error) {
            console.log(error);
            
        }
    }

    // function to fetch all shows
    const fetchShows = async () => {
        try {
            const {data} = await axios.get('/api/admin/all-shows');
            if(data.success){
                setShows(data.shows);
            }
            else{
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            
        }
    }

    // fetch foavorite movies of user
    const fetchFavoritesMovies = async () => {
        try {
            const {data} = await axios.get('/api/user/favorites' , {
                headers: { Authorization: `Bearer ${await getToken()}` }})
            
            if(data.success){
                setFavoriteMovies(data.movies);
            }
            else{
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            
        }
    }


    useEffect(()=>{
        fetchShows();
    },[])

    useEffect(()=> {
        if(user){ // if user is logged in then only check for admin and fetch favorite movies
            fetchIsAdmin();
            fetchFavoritesMovies();
        }
    }, [user])

    const value = {
        axios,
        fetchIsAdmin,
        user, getToken, navigate, isAdmin, shows,
        favoriteMovies,fetchFavoritesMovies,
        TMDB_IMAGE_BASE_URL
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext);


// import { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";
// import { useAuth, useUser } from "@clerk/clerk-react";
// import { useLocation, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";

// axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

// export const AppContext = createContext();

// export const AppProvider = ({ children }) => {
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [shows, setShows] = useState([]);
//   const [favoriteMovies, setFavoriteMovies] = useState([]);
//   const [loadingAdmin, setLoadingAdmin] = useState(true);   // ⚠ NEW
//   const [loadingShows, setLoadingShows] = useState(true);   // ⚠ NEW

//   const TMDB_IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

//   const { user } = useUser();
//   const { getToken } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();

//   /* ------------------ AXIOS TOKEN INTERCEPTOR (BEST PRACTICE) ------------------ */
//   axios.interceptors.request.use(async (config) => {
//     const token = await getToken();
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   });

//   /* ------------------------ CHECK ADMIN ------------------------ */
// //   const fetchIsAdmin = async () => {
// //     try {
// //       setLoadingAdmin(true);
// //       const { data } = await axios.get("/api/admin/is-admin");

// //       setIsAdmin(data.isAdmin);
// //       setLoadingAdmin(false);

// //       // redirect only AFTER we know status
// //       if (!data.isAdmin && location.pathname.startsWith("/admin")) {
// //         toast.error("Access denied — Admins only");
// //         navigate("/");
// //       }
// //     } catch (error) {
// //       console.log("Admin check error:", error);
// //       setLoadingAdmin(false);
// //     }
// //   };
//     const fetchIsAdmin = async () => {
//     try {
//         setLoadingAdmin(true);
//         const {data} = await axios.get('/api/admin/is-admin', {
//             headers: { Authorization: `Bearer ${await getToken()}` }
//         });

//         setIsAdmin(data.isAdmin);

//         // redirect only AFTER we know status
//       if (!data.isAdmin && location.pathname.startsWith("/admin")) {
//         toast.error("Access denied — Admins only");
//         navigate("/");
//       }
//     } catch (error) {
//         setIsAdmin(false);
//     } finally {
//         setLoadingAdmin(false);
//     }
// };


//   /* ------------------------ FETCH SHOWS ------------------------ */
//   const fetchShows = async () => {
//     try {
//       setLoadingShows(true);
//       const { data } = await axios.get("/api/shows/all");

//       if (data.success) setShows(data.shows);
//       else toast.error(data.message);

//       setLoadingShows(false);
//     } catch (error) {
//       console.log(error);
//       setLoadingShows(false);
//     }
//   };

//   /* ------------------------ FAVORITES ------------------------ */
//   const fetchFavoritesMovies = async () => {
//     try {
//       const { data } = await axios.get("/api/movies/favorites");
//       if (data.success) setFavoriteMovies(data.movies);
//       else toast.error(data.message);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   /* ------------------------ EFFECTS ------------------------ */
//   useEffect(() => {
//     fetchShows();
//   }, []);

//   useEffect(() => {
//     if (!user) return;
//     fetchIsAdmin();
//     fetchFavoritesMovies();
//   }, [user]);

//   /* ------------------------ VALUE ------------------------ */
//   const value = {
//     axios,
//     user,
//     getToken,
//     navigate,
//     isAdmin, fetchIsAdmin,
//     shows,
//     favoriteMovies,
//     TMDB_IMAGE_BASE_URL,
//     fetchFavoritesMovies,

//     // NEW states to prevent blank page
//     loadingAdmin,
//     loadingShows,
//   };

//   return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
// };

// export const useAppContext = () => useContext(AppContext);
