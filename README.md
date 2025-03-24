# members-only

User
- userid
- first name
- last name
- username/email
- password
- whether member or not

Message
- messageid
- title
- timestamp
- text
- userid of user who wrote

- add readme can see db models from populate script
- maybe remove the welcome screen / and have home as / just have /login and /signup pages bc can alternate btwn two
- can only html GET and POST so routes like patch app.get('/user/membership/patch') instead app.patch('/user/membership')
- GET html form sends data as req.query parameters, POST sends data as req.body
- need santize and validate forms maybe

- authentication is if user correct credentials and can log in
- authorization is if user has permission to do something
- before normal sessions only stored userId and then had to look up user in db everytime but w passport deserialize passport does automatically
