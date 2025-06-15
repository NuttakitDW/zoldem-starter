# === General ===
.PHONY: help dev dev-server dev-client build stop clean logs

help:
	@echo "🃏 Zoldem Commands:"
	@echo "  make dev           # Start both client and server in Docker"
	@echo "  make dev-server    # Start only Go server (hot reload)"
	@echo "  make dev-client    # Start only Vite frontend"
	@echo "  make build         # Build both containers (prod mode coming later)"
	@echo "  make stop          # Stop containers"
	@echo "  make clean         # Remove containers, volumes, cache"
	@echo "  make logs          # Tail docker logs"
	@echo "  make tail-log      # Tail local dev.log file"

# === Development ===

dev:
	docker-compose up --build

dev-server:
	docker-compose up --build server

dev-client:
	docker-compose up --build client

# === Utilities ===

build:
	docker-compose build

stop:
	docker-compose down

logs:
	docker-compose logs -f

clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

tail-log:
	tail -f logs/dev.log
