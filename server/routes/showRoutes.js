import express from 'express';
import {addShow, getNowPlayingMovies, getShows, getSingleShow} from '../controllers/showControllers.js';
import { protectAdmin } from '../middleware/auth.js';


const showRouter = express.Router();

showRouter.get('/now-playing' , protectAdmin, getNowPlayingMovies);
showRouter.post('/add' ,protectAdmin, addShow);
showRouter.get("all", getShows); // get all the shows
showRouter.get("/:movieId", getSingleShow);


export default showRouter;