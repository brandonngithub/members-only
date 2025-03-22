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

- can see db models from populate script

- authentication is if user correct credentials and can log in
- authorization is if user has permission to do something
- before normal sessions only stored userId and then had to look up user in db everytime but w passport deserialize passport does automatically
