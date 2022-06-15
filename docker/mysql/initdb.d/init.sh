#! /bin/bash
set -e

mysql --user=$MYSQL_ROOT_USERNAME --password=$MYSQL_ROOT_PASSWORD<<EOF
grant all privileges on $MYSQL_DATABASE.* to '$MYSQL_ROOT_USERNAME'@'%';
EOF