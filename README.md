# members-only

A message board where everyone can view posts. Though only users with membership can view who wrote a post, view when a post was created, and create new posts. Additionally admin users can do everything a member can + delete posts.

## Topics practiced in this project

- Backend programming with `Express.js`
- Working with `PostgreSQL` databases
- Form sanitization and validation
- Password hashing via `bcrypt`
- Authentication with `Passport.js`

## To run this project locally

- Clone the repository locally
- Create a `.env` file and add your custom variables
- Run the `populatedb.js` script
- Start the app with `node app.js`
- Visit [http://localhost:3000/](http://localhost:3000/) to check out the app in your browser

## Random notes to self

- in HTML can only GET and POST so routes like patch app.post('/user/membership/patch') instead app.patch('/user/membership')
- GET in HTML forms send data as req.query parameters, POST sends data as req.body
- authentication is if user correct credentials and can log in
- authorization is if user has permission to do something
- before w normal sessions, only userId stored, and then had to look up user in db everytime but w passport deserialize passport does automatically
