# Breddit - a reddit clone

**Note: This project is still in progress**

## Technologies Used

* NodeJS
* ExpressJS
* Pug
* Bootstrap

## Run the project locally

* Clone the project - `git clone git@github.com:PratikAwaik/breddit.git`
* Run `npm install` to install the dependencies for the project.
* For the database you need to create an account MongoDB Atlas. Follow the steps [here](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose#setting_up_the_mongodb_database)
* After setting up the databse, create a `.env` file in the root and add this line `MONGODB_URI=<Your MongoDB URL here>`. Replace `<>` with your MongoDB URL.
* Now, in your terminal run `npm run serverstart` to start your local server.
* Hop onto the browser and open `localhost:3000`.

## Future additions and improvements

The project still needs to have much more functionality. Current list of improvements are as follows:

* In addition to bootstrap, add much more custom designs. Might possibly remove bootstrap as a whole (which might be a "long term" thing).
* Change the UI as a whole. Right now, my main focus is on the functionality of the project. Once this completes, I will be focusing on the UI/UX part.
* Add ReactJS to the project.
* Also, I am thinking of changing `clubs` to something else (haven't thought of it yet).
* Adding images, videos and comments to the post.
* Make user profile page.

## Contribute to the project

Submit a pull request if you have any new feature, improvement or if you have found any bug :)


