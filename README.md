# Todo API

A RESTful API for managing todos built with Node.js, Express, and MongoDB.

## Features

- CRUD operations for todos
- Status tracking (pending, in-progress, completed)
- Priority levels (low, medium, high)
- Due date management
- Filter todos by status and priority
- Docker support for easy deployment
- Input validation
- Error handling

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Docker
- Docker Compose

## Prerequisites

- Docker
- Docker Compose

## Project Structure

```

## Data Persistence

MongoDB data is persisted using Docker volumes:
- Location: `mongodb_data` volume
- Survives container restarts
- Can be removed with `docker-compose down -v`

## Development Tips

1. Changes to code will automatically reflect due to volume mounting
2. If you update dependencies (package.json):
   ```bash
   docker-compose up --build -d
   ```
3. To clean everything and start fresh:
   ```bash
   docker-compose down -v
   docker-compose up --build -d
   ```

## License

MIT License

## Support

For support, please create an issue in the repository.

## Running with Docker

### First Time Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd todo-api
```

2. Build and start the containers:
```bash
# Build and start all services
docker-compose up --build -d
```

The API will be available at `http://localhost:5000`

### Daily Development Commands

```bash
# Start the services
docker-compose up -d

# Stop the services
docker-compose down

# View logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app
docker-compose logs -f mongodb

# Restart services
docker-compose restart

# Rebuild and start (after dependencies change)
docker-compose up --build -d
```

### Container Management

```bash
# List running containers
docker ps

# Access container shell
docker exec -it todo-app sh
docker exec -it todo-mongodb bash

# View container logs
docker logs todo-app
docker logs todo-mongodb

# Remove containers and volumes
docker-compose down -v
```

## API Endpoints

### Todos
- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get a specific todo
- `POST /api/todos` - Create a new todo
- `PATCH /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo
- `GET /api/todos/status/:status` - Get todos by status
- `GET /api/todos/priority/:priority` - Get todos by priority

### Request Body Example (POST/PATCH)

```json
{
    "title": "Complete project",
    "description": "Finish the todo API project",
    "status": "pending",
    "priority": "high",
    "dueDate": "2024-03-20T00:00:00.000Z"
}
```

## Environment Variables

The following environment variables are configured in docker-compose.yml:

```yaml
environment:
  - NODE_ENV=development
  - PORT=5000
  - MONGODB_URI=mongodb://mongodb:27017/todo-app
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
```bash
# Check if MongoDB container is running
docker ps | grep mongodb

# Check MongoDB logs
docker-compose logs mongodb
```

2. **API Not Responding**
```bash
# Check application logs
docker-compose logs app

# Restart the application
docker-compose restart app
```

3. **Container Won't Start**
```bash
# Remove containers and volumes
docker-compose down -v

# Rebuild and start
docker-compose up --build -d
```

### Health Check

```bash
# Check container status
docker ps

# Check application health
curl http://localhost:5000/api/todos
```

3. Stop the application:
```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers along with volumes
docker-compose down -v
```