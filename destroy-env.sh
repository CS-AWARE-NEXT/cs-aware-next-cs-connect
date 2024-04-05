#!/bin/bash

bash make.sh -u

docker volume prune -f

docker volume rm cs-aware-next-cs-connect_pgadmin cs-aware-next-cs-connect_postgres