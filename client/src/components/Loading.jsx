import React from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// to show animated loading when open a wrong movie or the movie data is not available
const Loading = () => {

    const {nextUrl} = useParams();
    const navigate = useNavigate();

    useEffect(()=>{
        if(nextUrl){
            setTimeout(()=> {
                navigate('/'+ nextUrl)
            },10000)
        }
    },[])
    return (
        <div className="flex justify-center items-center h-[80vh]">
            <div className="animate-spin rounded-full h-14 w-14 border-2 border-t-primary"></div>
        </div>
    );
}

export default Loading;