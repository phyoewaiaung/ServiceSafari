# 🐳 Essential Docker Guide

> Complete Docker command reference for ServiceSafari project and beyond

## 📚 Table of Contents
- [Basic Concepts](#-basic-concepts)
- [Container Management](#-container-management)
- [Image Management](#-image-management)
- [ServiceSafari Commands](#-servicesafari-commands)
- [Networking](#-networking)
- [Volumes & Data](#-volumes--data)
- [Monitoring & Debugging](#-monitoring--debugging)
- [Cleanup & Maintenance](#-cleanup--maintenance)
- [Advanced Tips](#-advanced-tips)

---

## 🎯 Basic Concepts

### **What is Docker?**
Docker is a platform for developing, shipping, and running applications in containers.

### **Container vs Image**
- **Image**: A blueprint/template (like a class)
- **Container**: A running instance of an image (like an object)

### **Key Terms**
- **Container**: Isolated application environment
- **Image**: Read-only template for containers
- **Registry**: Place to store images (Docker Hub)
- **Volume**: Persistent storage for containers
- **Network**: Communication between containers

---

## 🚀 Container Management

### **View Containers**
```bash
# Show running containers
docker ps

# Show all containers (running + stopped)
docker ps -a

# Show container details
docker inspect container-name

# Show container resource usage
docker stats container-name
```

### **Start/Stop Containers**
```bash
# Start a stopped container
docker start container-name

# Stop a running container
docker stop container-name

# Restart a container
docker restart container-name

# Force stop a container
docker kill container-name
```

### **Remove Containers**
```bash
# Remove a stopped container
docker rm container-name

# Force remove a running container
docker rm -f container-name

# Remove all stopped containers
docker container prune

# Remove all containers (running + stopped)
docker rm -f $(docker ps -aq)
```

### **Execute Commands in Containers**
```bash
# Run a command in a container
docker exec container-name command

# Get an interactive shell
docker exec -it container-name /bin/bash
docker exec -it container-name sh

# View container logs
docker logs container-name
docker logs container-name -f          # Follow logs
docker logs container-name --tail 50   # Last 50 lines
```

---

## 📦 Image Management

### **View Images**
```bash
# List all images
docker images

# Show image details
docker inspect image-name

# Show image history
docker history image-name
```

### **Build Images**
```bash
# Build an image with Dockerfile
docker build -t image-name .

# Build with custom tag
docker build -t username/repo:version .

# Build without cache
docker build --no-cache -t image-name .
```

### **Pull/Push Images**
```bash
# Pull an image from registry
docker pull image-name
docker pull username/repo:tag

# Push an image to registry
docker push username/repo:tag

# Login to registry
docker login
```

### **Remove Images**
```bash
# Remove an image
docker rmi image-name

# Force remove an image
docker rmi -f image-name

# Remove all unused images
docker image prune

# Remove all images
docker rmi -f $(docker images -q)
```

---

## 🦁 ServiceSafari Commands

### **Project Structure**
```
ServiceSafari/
├── auth-service/          # Laravel Authentication
├── analytics-service/     # Python FastAPI
├── gateway/              # Node.js API Gateway
└── user-dashboard/        # React Frontend
```

### **Build Service Images**
```bash
# Build Auth Service (Laravel)
docker build -t auth-service ./auth-service

# Build Analytics Service (Python)
docker build -t analytics-service ./analytics-service

# Build all services
docker build -t auth-service ./auth-service && \
docker build -t analytics-service ./analytics-service
```

### **Run Services**
```bash
# Run Auth Service on port 3002
docker run -d -p 3002:80 --name auth-service-container auth-service

# Run Analytics Service on port 3003
docker run -d -p 3003:3003 --name analytics-service-container analytics-service

# Run with environment variables
docker run -d -p 3002:80 --name auth-service-container \
  -e JWT_SECRET=your-secret-key \
  -e DB_HOST=localhost \
  auth-service
```

### **Service Management**
```bash
# Check all services
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Test service health
docker exec auth-service-container curl -s http://localhost/health
docker exec analytics-service-container python -c "import urllib.request; print(urllib.request.urlopen('http://localhost:3003/health').read().decode())"

# View service logs
docker logs auth-service-container
docker logs analytics-service-container -f
```

### **Quick Start All Services**
```bash
# Start all Docker services
docker run -d -p 3002:80 --name auth-service-container auth-service && \
docker run -d -p 3003:3003 --name analytics-service-container analytics-service

# Stop all services
docker stop auth-service-container analytics-service-container

# Remove all services
docker rm auth-service-container analytics-service-container
```

---

## 🌐 Networking

### **View Networks**
```bash
# List networks
docker network ls

# Show network details
docker network inspect network-name
```

### **Create Networks**
```bash
# Create a custom network
docker network create services-network

# Connect container to network
docker network connect services-network container-name

# Disconnect from network
docker network disconnect services-network container-name
```

### **Port Mapping**
```bash
# Map container port to host port
docker run -p host-port:container-port image-name

# Map multiple ports
docker run -p 3002:80 -p 3003:3003 image-name

# Map to random host port
docker run -p 80 image-name
```

---

## 💾 Volumes & Data

### **Volume Management**
```bash
# List volumes
docker volume ls

# Create a volume
docker volume create volume-name

# Remove a volume
docker volume rm volume-name

# Remove all unused volumes
docker volume prune
```

### **Mount Volumes**
```bash
# Mount a named volume
docker run -v volume-name:/container/path image-name

# Mount host directory
docker run -v /host/path:/container/path image-name

# Mount read-only
docker run -v /host/path:/container/path:ro image-name
```

### **ServiceSafari Volume Examples**
```bash
# Auth Service with database volume
docker run -d -p 3002:80 --name auth-service-container \
  -v auth-data:/var/www/html/storage \
  auth-service

# Analytics Service with data volume
docker run -d -p 3003:3003 --name analytics-service-container \
  -v analytics-data:/app/data \
  analytics-service
```

---

## 🔍 Monitoring & Debugging

### **Resource Monitoring**
```bash
# Show real-time resource usage
docker stats

# Show resource usage for specific container
docker stats container-name

# Show system disk usage
docker system df
```

### **Debugging Commands**
```bash
# Check container processes
docker top container-name

# Check container filesystem
docker exec container-name ls -la

# Copy files from container
docker cp container-name:/container/path /host/path

# Copy files to container
docker cp /host/path container-name:/container/path
```

### **Health Checks**
```bash
# Check container health
docker inspect container-name --format='{{.State.Health.Status}}'

# Run health check manually
docker exec container-name curl -f http://localhost/health
```

---

## 🧹 Cleanup & Maintenance

### **Regular Cleanup**
```bash
# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune

# Remove all unused networks
docker network prune

# Remove all unused volumes
docker volume prune

# Complete system cleanup
docker system prune -a
```

### **Force Cleanup**
```bash
# Stop and remove all containers
docker stop $(docker ps -q) && docker rm $(docker ps -aq)

# Remove all images
docker rmi -f $(docker images -q)

# Nuclear option - clean everything
docker system prune -a --volumes --force
```

---

## 🚀 Advanced Tips

### **Docker Compose**
```bash
# Start services with compose
docker-compose up -d

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build

# View logs
docker-compose logs -f
```

### **Multi-stage Builds**
```dockerfile
# Build stage
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Production stage
FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["node", "server.js"]
```

### **Optimization Tips**
```bash
# Use .dockerignore to exclude files
echo "node_modules\n.git\n*.log" > .dockerignore

# Minimize image size
FROM alpine:latest  # Use smaller base images

# Clean up package manager cache
RUN apt-get update && apt-get install -y package && rm -rf /var/lib/apt/lists/*
```

### **Security Best Practices**
```bash
# Run as non-root user
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Use specific image tags
FROM python:3.9.6-slim  # Not just 'latest'

# Scan for vulnerabilities
docker scan image-name
```

---

## 🎯 Quick Reference Cheat Sheet

### **Everyday Commands**
```bash
docker ps                    # What's running?
docker logs name            # What's happening?
docker stop name             # Stop it
docker start name            # Start it
docker rm name               # Remove it
docker images                # What images?
docker rmi image             # Remove image
docker exec -it name sh     # Get shell
```

### **ServiceSafari Workflow**
```bash
# Build
docker build -t auth-service ./auth-service
docker build -t analytics-service ./analytics-service

# Run
docker run -d -p 3002:80 --name auth-service-container auth-service
docker run -d -p 3003:3003 --name analytics-service-container analytics-service

# Test
docker exec auth-service-container curl -s http://localhost/health
docker exec analytics-service-container python -c "import urllib.request; print(urllib.request.urlopen('http://localhost:3003/health').read().decode())"

# Cleanup
docker stop auth-service-container analytics-service-container
docker rm auth-service-container analytics-service-container
```

### **Emergency Commands**
```bash
# Stop everything
docker stop $(docker ps -q)

# Remove everything
docker system prune -a --volumes --force

# Check disk usage
docker system df
```

---

## 🔧 Troubleshooting

### **Common Issues**
```bash
# Port already in use
docker run -p 3002:80 image-name  # Error: port already in use
# Solution: Find and stop the container using the port
netstat -tulpn | grep :3002
docker stop container-name

# Container won't start
docker logs container-name  # Check logs for errors

# Out of disk space
docker system df
docker system prune -a
```

### **Performance Issues**
```bash
# Check resource usage
docker stats

# Optimize images
docker history image-name  # Check layer sizes
docker build --no-cache   # Rebuild cleanly
```

---

## 📖 Additional Resources

- [Official Docker Documentation](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/reference/)
- [Best Practices Guide](https://docs.docker.com/develop/dev-best-practices/)

---

## 🎉 You're Now a Docker Master!

With this guide, you can:
- ✅ Manage containers and images
- ✅ Build and deploy services
- ✅ Debug and monitor applications
- ✅ Optimize performance
- ✅ Maintain clean Docker environment

**Happy Dockering! 🐳**
