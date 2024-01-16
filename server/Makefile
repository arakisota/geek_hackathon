MIGRATE_SRC := migrate/migrate.go
MAIN_SRC := main.go

.PHONY: migrate up down docker-clean

run-server:
	GO_ENV=dev go run ${MAIN_SRC}

migrate:
	GO_ENV=dev go run ${MIGRATE_SRC}

up:
	@docker compose up -d

down:
	@docker compose down

docker-clean:
	@docker-compose down --rmi all --volumes --remove-orphans