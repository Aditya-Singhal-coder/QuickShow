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
            const {data} = await axios.get('/api/shows/all');
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
            const {data} = await axios.get('/api/movies/favorites' , {
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