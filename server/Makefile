SRC := migrate/migrate.go

.PHONY: up down docker-clean

run-server:
	GO_ENV=dev go run ${SRC}

up:
	@docker compose up -d

down:
	@docker compose down

docker-clean:
	@docker-compose down --rmi all --volumes --remove-orphans