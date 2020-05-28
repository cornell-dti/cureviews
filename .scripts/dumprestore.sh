# Restore all bson files found in the directory passed in as a command line argument
mongorestore -h 127.0.0.1 --port 3001 -d test "$1/classes.bson" --drop
mongorestore -h 127.0.0.1 --port 3001 -d test "$1/subjects.bson" --drop
mongorestore -h 127.0.0.1 --port 3001 -d test "$1/reviews.bson" --drop

