all: up

up:
	docker-compose up --build -d

down:
	docker-compose down

logs:
	docker-compose logs -f

re: down up

clean:
	docker-compose down -v
	rm -rf backend/node_modules frontend/node_modules blockchain/node_modules
