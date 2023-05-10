# Open Social Platform (backend)

This repo contains backend source code of "Open Social Platform" project.

## Features
- User Auth
- User Data fetch
- Post creation

## SQL Database structure

### Table "users"
- id : int(11) NOT NULL AI
- nickname : varchar(20)
- email : varchar(250)
- password : varchar(250)
- create_time : timestamp | CURRENT_TIMESTAMP

### Table "users_meta"
- id : int(11) NOT NULL AI
- userid : int(11) | foreign key of users.id
- keyname : varchar(255)
- password : varchar(250)
- value : json

### Table "sessions"
- id : int(11) NOT NULL AI
- userid : int(11) | foreign key of users.id
- token : varchar(500)
- create_time : timestamp | CURRENT_TIMESTAMP
