import React from 'react';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import SeatLayout from './pages/SeatLayout';
import MyBookings from './pages/MyBookings';
import Favourite from './pages/Favourite';
import {Toaster} from 'react-hot-toast';
import Footer from './components/Footer';
import Layout from './pages/admin/Layout';
import Dashboard from './pages/admin/Dashboard';
import AddShows from './pages/admin/AddShows.jsx';
import ListShows from './pages/admin/ListShows.jsx';
import ListBookings from './pages/admin/ListBookings';
import { useAppContext } from './context/AppContext';
import { SignIn } from '@clerk/clerk-react';
import Loading from './components/Loading.jsx';

const App = () => {
  // navbar must be hide when we are on admin page
  // for this we need to check the url before return

  const isAdminRoute = useLocation().pathname.startsWith('/admin')

  {/* for check if user is log in or not*/}
    const {user} = useAppContext();  


  return (
    <>
      <Toaster/>   {/* use this to send notification for all the routes*/}
      {!isAdminRoute &&  <Navbar/>}
      {/* whenever we load the web page the navbar will be mounted */}


      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/movies' element={<Movies/>} />
        <Route path='/movies/:id' element={<MovieDetails/>} />
        <Route path='/movies/:id/:date' element={<SeatLayout/>} />
        <Route path='/my-bookings' element={<MyBookings/>} />

        <Route path='/loading/:nextUrl' element={<Loading/>} />


        <Route path='/favourites' element={<Favourite/>} />

        {/*Routes for Admin*/}

        <Route path='/admin/*' element={user ? <Layout/> : (
          <div className='min-h-screen flex justify-center items-center'>
            <SignIn fallbackRedirectUrl={'/admin'}/>
          </div>
        )}>
            <Route index element={<Dashboard/>}/>
            <Route path='add-shows' element={<AddShows/>}/>
            <Route path='list-shows' element={<ListShows/>}/>
            <Route path='list-bookings' element={<ListBookings/>}/>
        </Route>

      </Routes>
        {!isAdminRoute &&  <Footer/>}
    </>
  );
}

export default App;
